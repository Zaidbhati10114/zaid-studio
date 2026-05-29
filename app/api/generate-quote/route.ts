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

// ─── Logging ──────────────────────────────────────────────────────────────────

function log(stage: string, data?: Record<string, unknown>) {
  console.log(JSON.stringify({ tag: "QG", stage, t: Date.now(), ...data }));
}

function logError(stage: string, err: unknown, extra?: Record<string, unknown>) {
  const e = err instanceof Error ? err : new Error(String(err));
  console.error(JSON.stringify({
    tag: "QG_ERR",
    stage,
    t: Date.now(),
    message: e.message,
    name: e.name,
    status: (err as any)?.status ?? (err as any)?.httpStatus ?? undefined,
    statusText: (err as any)?.statusText ?? undefined,
    errorDetails: (err as any)?.errorDetails ?? undefined,
    cause: e.cause ? String(e.cause) : undefined,
    stack: e.stack,
    ...extra,
  }));
}

// ─── Validation ───────────────────────────────────────────────────────────────

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

Your goal:
- Be simple, clear, and client-friendly
- Avoid technical jargon unless necessary
- Focus on business value, not engineering details
- Make the proposal feel practical and achievable

Respond ONLY with valid JSON. Use EXACTLY this structure:

{
  "complexity": "Simple" | "Medium" | "Complex",
  "summary": "Explain the project clearly in 1-2 concise sentences using non-technical language",
  "estimatedTimeline": "Clear time estimate",
  "estimatedCost": "Realistic cost range in ₹",
  "whyHireMe": "1 short client-focused line that builds trust and confidence. Keep it human, practical, and easy to relate to. Avoid resume metrics, user numbers, or corporate-style claims.",
  "deliverables": [
    "Clear business outcome",
    "Feature explained in simple language"
  ],
  "techStack": [],
  "phases": [
    { "name": "Phase name", "duration": "Estimated duration" }
  ],
  "clientResponsibilities": [],
  "risks": [
    { "risk": "Short risk title", "mitigation": "Simple explanation of how it will be handled" }
  ],
  "nextSteps": [
    "Quick discovery discussion",
    "Finalize project scope and timeline",
    "Begin development process"
  ]
}

IMPORTANT RULES:
- Use SIMPLE language (non-technical)
- Do NOT overcomplicate simple projects
- Never mention user counts, enterprise metrics, or resume statistics
- Keep proposals realistic and believable with reasonably tight pricing ranges
- Avoid sounding like a large enterprise agency
- Deliverables must feel valuable, not technical
- Keep everything concise

PRICING GUIDELINES (Indian market):
- Simple websites/landing pages: ₹5,000 – ₹15,000
- Medium business platforms/management systems: ₹15,000 – ₹40,000
- Complex SaaS platforms: ₹40,000 – ₹80,000+
- Avoid enterprise-level pricing unless scope clearly requires it

PERSONALIZATION:
- Stage "Starting from scratch" → suggest full build with simple structured roadmap
- Stage "I have a basic website" → focus on improvements and better UX
- Stage "Need redesign" → focus on UI/UX, performance, conversion improvements
- Stage "Need advanced features" → increase scope and technical complexity
- Low budget → suggest MVP-style solution
- "ASAP" timeline → keep scope focused and achievable quickly
- Flexible timeline → allow better polish and planning

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
  const modelName = "gemini-3-flash-preview";
  log("gemini_start", { model: modelName, promptChars: prompt.length });
  const t0 = Date.now();

  let text = "";
  let lastErr: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      text = result.response.text();
      log("gemini_ok", { ms: Date.now() - t0, attempt, rawChars: text.length, preview: text.slice(0, 120).replace(/\n/g, " ") });
      break; // success — exit loop
    } catch (err) {
      lastErr = err;
      const status = (err as any)?.status;
      const retryable = status === 503 || status === 429;
      logError("gemini_call", err, { ms: Date.now() - t0, attempt, retryable });

      if (!retryable || attempt === 3) throw err;

      // wait 1s, then 2s before next attempt
      await new Promise(res => setTimeout(res, attempt * 1000));
    }
  }

  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI response did not contain valid JSON");
    const parsed = JSON.parse(match[0]) as GeneratedQuote;
    log("gemini_parsed", { complexity: parsed.complexity });
    return parsed;
  } catch (err) {
    logError("gemini_parse", err, { rawPreview: text.slice(0, 300).replace(/\n/g, " ") });
    throw err;
  }
}

// ─── DB persistence ───────────────────────────────────────────────────────────

async function saveQuote(
  body: QuoteRequestBody,
  quote: GeneratedQuote
): Promise<string> {
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
  const requestId = crypto.randomUUID().slice(0, 8);
  log("request_start", { requestId });

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

  log("request_valid", { requestId, projectType: body.projectType, stage: body.stage, timeline: body.timeline });

  // 2. Generate quote with AI
  let quote: GeneratedQuote;
  try {
    quote = await callGemini(buildPrompt(body));
  } catch (err) {
    console.error("[generate-quote] AI generation failed:", err);
    return json(
      {
        error: "Failed to generate proposal. Please try again.",
        details: err instanceof Error ? err.message : "Unknown AI error",
      },
      502
    );
  }

  // 3. Persist to DB
  let quoteId: string;
  try {
    quoteId = await saveQuote(body, quote);
  } catch (err) {
    console.error("[generate-quote] DB save failed:", err);
    return json(
      {
        error: "Proposal was generated but could not be saved. Please try again.",
        details: err instanceof Error ? err.message : "Unknown DB error",
      },
      500
    );
  }

  log("request_done", { requestId, quoteId });
  return json({ success: true, quoteId, quote });
}