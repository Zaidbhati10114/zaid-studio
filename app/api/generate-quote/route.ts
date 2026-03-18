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
        const { name, email, projectType, description } = await request.json();

        if (!name || !email || !projectType || !description) {
            return new Response(
                JSON.stringify({ error: "All fields are required" }),
                { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
            );
        }

        const prompt = `
You are an expert project consultant at Zaid Studio, a solo full-stack dev studio.
A potential client has submitted a project inquiry.
Generate a detailed, professional project proposal based on the developer profile and client request.

Respond ONLY with a valid JSON object — no markdown, no backticks, no explanation outside the JSON.

The JSON must have EXACTLY these fields:

{
  "complexity": "Simple" | "Medium" | "Complex",
  "summary": "2-3 sentences specific to their project, mentioning their exact use case",
  "servicesMatched": ["service1", "service2"],
  "estimatedTimeline": "e.g. 4-6 weeks",
  "estimatedCost": "cost range in Indian Rupees (₹)",
  "whyHireMe": "2-3 sentences with specific proof points from the developer profile",
  "deliverables": [
    "Specific deliverable 1",
    "Specific deliverable 2",
    "Specific deliverable 3",
    "Specific deliverable 4",
    "Specific deliverable 5"
  ],
  "techStack": ["Technology1", "Technology2", "Technology3"],
  "phases": [
    {
      "name": "Discovery",
      "duration": "X days",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "name": "Design",
      "duration": "X days/weeks",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "name": "Build",
      "duration": "X weeks",
      "tasks": ["Task 1", "Task 2", "Task 3", "Task 4"]
    },
    {
      "name": "Launch",
      "duration": "X days",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    }
  ],
  "clientResponsibilities": [
    "Responsibility 1",
    "Responsibility 2",
    "Responsibility 3",
    "Responsibility 4"
  ],
  "risks": [
    {
      "risk": "Risk description",
      "mitigation": "How we handle it"
    },
    {
      "risk": "Risk description",
      "mitigation": "How we handle it"
    },
    {
      "risk": "Risk description",
      "mitigation": "How we handle it"
    }
  ],
  "vsNoCode": "2 sentences explaining why custom development is better than no-code tools for this specific project",
  "nextSteps": [
    "Step 1",
    "Step 2",
    "Step 3"
  ]
}

Rules:
- complexity: Simple = landing page/small site, Medium = web app/dashboard, Complex = SaaS/marketplace
- deliverables must be concrete and specific to their project (not generic)
- techStack must match the developer's actual skills and be appropriate for the project
- phases must have realistic durations that add up to estimatedTimeline
- clientResponsibilities should be practical things the client needs to provide
- risks must be real risks for this type of project with practical mitigations
- vsNoCode must be specific to their project type, not generic
- estimatedCost in Indian Rupees based on complexity and project type
- Be specific and professional — avoid generic filler content

Developer Profile:
${RESUME_CONTEXT}

Client Inquiry:
Name: ${name}
Email: ${email}
Project Type: ${projectType}
Description: ${description}
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