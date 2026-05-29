// app/api/generate-quote/route.ts
import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase-server";
import { RESUME_CONTEXT } from "@/lib/resumeContext";
import type { GeneratedQuote } from "@/hooks/useQuote";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// ─── Structured logger ────────────────────────────────────────────────────────
// All logs tagged [QG] so you can filter in Vercel with: qg
function log(stage: string, data: Record<string, unknown>) {
  console.log(JSON.stringify({ tag: "QG", stage, t: Date.now(), ...data }));
}

function logError(stage: string, err: unknown, extra?: Record<string, unknown>) {
  const isError = err instanceof Error;
  console.error(JSON.stringify({
    tag: "QG_ERR",
    stage,
    t: Date.now(),
    message: isError ? err.message : String(err),
    name: isError ? err.name : "UnknownError",
    stack: isError ? err.stack : undefined,
    // Gemini SDK puts the HTTP status + body inside the error object
    // under these two keys — this is what tells us 429 vs 503 vs timeout
    status: (err as any)?.status ?? (err as any)?.httpStatus ?? undefined,
    statusText: (err as any)?.statusText ?? undefined,
    errorDetails: (err as any)?.errorDetails ?? undefined,
    cause: isError && err.cause ? String(err.cause) : undefined,
    ...extra,
  }));
}

// ─── Types & validation ───────────────────────────────────────────────────────

interface QuoteRequestBody {
  name: string;
  email: string;
  projectType: string;
  stage: string;
  budget?: string;
  timeline: string;
  description: string;
}

function validateBody(body: Partial<QuoteRequestBody>): body is QuoteRequestBody {
  const required = ["name", "email", "projectType", "stage", "timeline", "description"] as const;
  return required.every((key) => typeof body[key] === "string" && body[key]!.trim().length > 0);
}

// ─── AI generation ────────────────────────────────────────────────────────────

function buildPrompt(body: QuoteRequestBody): string {
  return `
You are a professional project consultant helping clients understand their project clearly.
... (keep your existing prompt exactly as-is)
Developer Profile:
${RESUME_CONTEXT}

Client Inquiry:
Name: ${body.name}
Project Type: ${body.projectType}
Description: ${body.description}

Additional Context:
Current Stage: ${body.stage}
Budget Range: ${body.budget ?? "Not specified"}
Timeline Expectation: ${body.timeline}
`;
}

async function callGemini(prompt: string): Promise<GeneratedQuote> {
  const model = "gemini-2.0-flash-exp"; // or whatever your working model string is
  log("gemini_start", { model, promptChars: prompt.length });

  const t0 = Date.now();
  let rawText = "";

  try {
    const geminiModel = genAI.getGenerativeModel({ model });
    const result = await geminiModel.generateContent(prompt);
    rawText = result.response.text();

    log("gemini_ok", {
      ms: Date.now() - t0,
      rawChars: rawText.length,
      // First 120 chars so you can see if it returned garbage vs real JSON
      preview: rawText.slice(0, 120).replace(/\n/g, " "),
    });
  } catch (err) {
    logError("gemini_call", err, {
      ms: Date.now() - t0,
      model,
      promptChars: prompt.length,
    });
    throw err;
  }

  // Parse step is separate so we know if Gemini succeeded but JSON was malformed
  try {
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in response");
    const parsed = JSON.parse(match[0]) as GeneratedQuote;
    log("gemini_parsed", { complexity: parsed.complexity });
    return parsed;
  } catch (err) {
    logError("gemini_parse", err, {
      rawPreview: rawText.slice(0, 300).replace(/\n/g, " "),
    });
    throw err;
  }
}

// ─── DB persistence ───────────────────────────────────────────────────────────

async function saveQuote(body: QuoteRequestBody, quote: GeneratedQuote): Promise<string> {
  const t0 = Date.now();
  try {
    const { data, error } = await supabaseAdmin
      .from("quotes")
      .insert({
        name: body.name,
        email: body.email,
        project_type: body.projectType,
        description: body.description,
        summary: quote.summary,
        estimated_timeline: quote.estimatedTimeline,
        estimated_cost: quote.estimatedCost,
        why_hire_me: quote.whyHireMe,
        next_steps: quote.nextSteps,
        complexity: quote.complexity,
        deliverables: quote.deliverables,
        tech_stack: quote.techStack,
        phases: quote.phases,
        client_responsibilities: quote.clientResponsibilities,
        risks: quote.risks,
        status: "new",
      })
      .select("id")
      .single();

    if (error) throw error;
    log("db_ok", { ms: Date.now() - t0, quoteId: data.id });
    return data.id as string;
  } catch (err) {
    logError("db_save", err, { ms: Date.now() - t0 });
    throw err;
  }
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function OPTIONS() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8); // ties all logs for one request together
  log("request_start", { requestId });

  // 1. Parse & validate
  let body: Partial<QuoteRequestBody>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!validateBody(body)) {
    log("validation_fail", { requestId, fields: Object.keys(body) });
    return json({ error: "Please complete all required fields" }, 400);
  }

  log("request_valid", {
    requestId,
    projectType: body.projectType,
    stage: body.stage,
    timeline: body.timeline,
    descriptionChars: body.description.length,
  });

  // 2. Generate quote
  let quote: GeneratedQuote;
  try {
    quote = await callGemini(buildPrompt(body));
  } catch (err) {
    // logError already called inside callGemini — just return the response
    return json(
      {
        error: "Failed to generate proposal. Please try again.",
        details: err instanceof Error ? err.message : "Unknown AI error",
      },
      502,
    );
  }

  // 3. Persist
  let quoteId: string;
  try {
    quoteId = await saveQuote(body, quote);
  } catch (err) {
    return json(
      {
        error: "Proposal was generated but could not be saved. Please try again.",
        details: err instanceof Error ? err.message : "Unknown DB error",
      },
      500,
    );
  }

  log("request_done", { requestId, quoteId });
  return json({ success: true, quoteId, quote });
}