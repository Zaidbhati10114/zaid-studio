// app/api/generate-quote/route.ts
export const runtime = "edge";
import { NextRequest } from "next/server";
import { generateQuote } from "@/lib/ai/quote-generator";
import type { GeneratedQuote } from "@/hooks/useQuote";
import * as Sentry from '@sentry/nextjs';
import { QuoteRequestBody } from "@/lib/types";
import { supabaseAdmin } from "@/lib/supabase-server";




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

// function log(stage: string, data?: Record<string, unknown>) {
//   console.log(JSON.stringify({ tag: "QG", stage, t: Date.now(), ...data }));
// }

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



function validateBody(body: Partial<QuoteRequestBody>): body is QuoteRequestBody {
  const required = ["name", "email", "projectType", "stage", "timeline", "description"] as const;
  return required.every((key) => typeof body[key] === "string" && body[key]!.trim().length > 0);
}

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
    console.log("db_ok", { ms: Date.now() - t0, quoteId: data.id });
    return data.id as string;
  } catch (err) {
    logError("db_save", err, { ms: Date.now() - t0 });
    Sentry.captureException(err, {
      tags: { layer: "supabase", operation: "insert_quote" },
      extra: { ms: Date.now() - t0, projectType: body.projectType },
    });
    throw err;
  }
}



// ─── Route handlers ───────────────────────────────────────────────────────────

export async function OPTIONS() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  console.log("request_start", { requestId });

  let body: Partial<QuoteRequestBody>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!validateBody(body)) {
    console.log("validation_fail", { requestId, fields: Object.keys(body) });
    return json({ error: "Please complete all required fields" }, 400);
  }

  console.log("request_valid", { requestId, projectType: body.projectType, stage: body.stage, timeline: body.timeline });
  Sentry.setUser({ email: body.email, username: body.name });
  Sentry.setTag("route", "generate-quote");

  // 2. Generate quote with AI
  let quote: GeneratedQuote;
  try {
    quote = await generateQuote(body);
  } catch (err) {
    Sentry.captureException(err, {  // ← Sentry stays here in route.ts only
      tags: { layer: "ai_fallback" },
    });
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

  console.log("request_done", { requestId, quoteId });
  return json({ success: true, quoteId, quote });
}