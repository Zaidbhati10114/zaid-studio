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
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI response did not contain valid JSON");

  return JSON.parse(match[0]) as GeneratedQuote;
}

// ─── DB persistence ───────────────────────────────────────────────────────────

async function saveQuote(
  body: QuoteRequestBody,
  quote: GeneratedQuote
): Promise<string> {
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
  return data.id as string;
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function OPTIONS() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  // 1. Parse & validate request body
  let body: Partial<QuoteRequestBody>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!validateBody(body)) {
    return json({ error: "Please complete all required fields" }, 400);
  }

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
    // Return the generated quote even if save fails — the user
    // can still see their proposal; we just can't give them a permalink.
    return json(
      {
        error: "Proposal was generated but could not be saved. Please try again.",
        details: err instanceof Error ? err.message : "Unknown DB error",
      },
      500
    );
  }

  return json({ success: true, quoteId, quote });
}