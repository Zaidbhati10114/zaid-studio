import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase-server";
import { RESUME_CONTEXT } from "@/lib/resumeContext";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { headers });
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      projectType,
      description,
      stage,
      budget,
      timeline,
    } = await request.json();

    if (!name || !email || !projectType || !description || !stage || !timeline) {
      return new Response(
        JSON.stringify({ error: "Please complete all required fields" }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    const prompt = `
You are a professional project consultant helping clients understand their project clearly.

Your goal:
- Be simple, clear, and client-friendly
- Avoid technical jargon unless necessary
- Focus on business value, not engineering details
- Make the proposal feel practical and achievable

Respond ONLY with valid JSON.

Use EXACTLY this structure:

{
  "complexity": "Simple" | "Medium" | "Complex",
  "summary": "Explain the project clearly in 1-2 concise sentences using non-technical language",
  "estimatedTimeline": "Clear time estimate",
  "estimatedCost": "Realistic cost range in ₹",
  "whyHireMe": "1 short client-focused line that builds trust and confidence. Keep it human, practical, and easy to relate to. Avoid resume metrics, user numbers, or corporate-style claims."
  "deliverables": [
    "Clear business outcome",
    "Feature explained in simple language",
    "User-facing functionality",
    "Practical improvement for the client"
  ],

  "techStack": [],
  "phases": [
  {
    "name": "Phase name",
    "duration": "Estimated duration"
  }
],
  "clientResponsibilities": [],
  "risks": [
  {
    "risk": "Short risk title",
    "mitigation": "Simple explanation of how it will be handled"
  }
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
- Never mention user counts, enterprise metrics, or resume statistics in the response
- Keep the proposal feeling personal and consultant-led rather than corporate
- Keep proposals realistic and believable
- Keep pricing ranges reasonably tight and believable
- Avoid overly broad estimates unless project scope is unclear
- Avoid sounding like a large enterprise agency
- Do NOT overwhelm the client
- Deliverables must feel valuable, not technical
- Keep everything concise
- Focus on clarity over detail


PRICING GUIDELINES:

- Keep pricing realistic and approachable for Indian startups, creators, and small businesses
- Focus on MVP-style pricing for early-stage products
- Simple websites or landing pages should usually range between ₹5,000 – ₹15,000
- Medium business platforms or management systems can range between ₹15,000 – ₹40,000
- Complex SaaS platforms can range between ₹40,000 – ₹80,000+ depending on features and scale
- Avoid enterprise-level pricing unless the project scope clearly requires it
- Keep estimates believable, practical, and founder-friendly

ADVANCED DETAILS RULES:

- For simple projects:
  - keep tech stack extremely minimal
  - When mentioning technologies, briefly explain them in simple client-friendly language
  - avoid unnecessary frameworks or infrastructure mentions
  - keep phases short and simple
  - avoid unnecessary risks or enterprise planning

- For medium projects:
  - include a basic roadmap
  - include only important technical considerations

- For complex projects:
  - provide more detailed implementation planning
  - include scalability and risk considerations when relevant

TONE GUIDELINES:

- confident
- practical
- modern
- consultative
- trustworthy

PERSONALIZATION LOGIC:

1. STAGE:
- If "Starting from scratch" → suggest full build with a simple structured roadmap
- If "I have a basic website" → focus on improvements, modernization, and better user experience
- If "Need redesign" → focus on UI/UX, performance, and conversion improvements
- If "Need advanced features" → increase project scope and technical complexity appropriately

2. BUDGET:
- If low budget → suggest a smaller MVP-style solution
- If mid budget → suggest a balanced scalable solution
- If high budget → allow more features, scalability, and polish
- If "Not sure" → provide a reasonable mid-range estimate

3. TIMELINE:
- If "ASAP" → keep scope focused and achievable quickly
- If flexible → allow better polish and planning
- If longer timeline → allow more refinement and scalability considerations

Developer Profile:
${RESUME_CONTEXT}

Client Inquiry:
Name: ${name}
Project Type: ${projectType}
Description: ${description}

Additional Context:
Current Stage: ${stage}
Budget Range: ${budget || "Not specified"}
Timeline Expectation: ${timeline}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response format");

    const aiResponse = JSON.parse(jsonMatch[0]);

    const { data, error } = await supabaseAdmin
      .from("quotes")
      .insert({
        name,
        email,
        project_type: projectType,
        description,
        summary: aiResponse.summary,
        services_matched: aiResponse.servicesMatched,
        estimated_timeline: aiResponse.estimatedTimeline,
        estimated_cost: aiResponse.estimatedCost,
        why_hire_me: aiResponse.whyHireMe,
        next_steps: aiResponse.nextSteps,
        complexity: aiResponse.complexity,
        deliverables: aiResponse.deliverables,
        tech_stack: aiResponse.techStack,
        phases: aiResponse.phases,
        client_responsibilities: aiResponse.clientResponsibilities,
        risks: aiResponse.risks,
        vs_no_code: aiResponse.vsNoCode,
        status: "new",
      })
      .select("id")
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        quoteId: data.id,
        quote: aiResponse,
      }),
      {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating quote:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate quote",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      }
    );
  }
}