import { QuoteRequestBody } from "../types";
import { QUOTE_STUDIO_CONTEXT } from "./agency-context";

export function buildQuotePrompt(
  body: QuoteRequestBody,
): string {
  const prompt = `
${QUOTE_STUDIO_CONTEXT}

You are generating an INITIAL project estimate for a potential client.

Create a practical, realistic, client-friendly proposal based only on the information provided.

IMPORTANT:
- Return ONLY one valid JSON object.
- Do NOT use markdown.
- Do NOT include explanations outside the JSON.
- Do NOT add extra fields.
- Do NOT invent requirements that are not supported by the project description.
- Keep wording concise and specific.
- Prices must be in Indian Rupees.
- Timelines must be realistic.

OUTPUT SCHEMA

{
  "complexity": "Medium",
  "summary": "",
  "servicesMatched": [],
  "estimatedTimeline": "",
  "estimatedCost": "",
  "whyHireMe": "",
  "deliverables": [],
  "techStack": [],
  "phases": [
    {
      "name": "",
      "duration": "",
      "tasks": []
    }
  ],
  "clientResponsibilities": [],
  "risks": [
    {
      "risk": "",
      "mitigation": ""
    }
  ],
  "vsNoCode": "",
  "nextSteps": []
}

FIELD RULES

complexity:
Must be exactly one of:
"Simple", "Medium", "Complex"

summary:
1-2 concise sentences explaining what is being built and the business goal.

servicesMatched:
Only services that genuinely apply.
Possible services include:
Landing Page, Website Development, Web Application,
SaaS Development, AI Integration, API Development,
Dashboard Development, CMS Integration, Booking System,
Payment Integration.

estimatedTimeline:
Realistic development duration.

estimatedCost:
Realistic estimate in Indian Rupees based on scope, complexity and features.

whyHireMe:
Briefly explain why custom development is appropriate for this project.

deliverables:
Only project-specific deliverables.

techStack:
Only technologies appropriate for the requirements.

phases:
Use realistic project phases.
Each phase must include:
- name
- duration
- tasks

clientResponsibilities:
Practical responsibilities such as supplying content, branding,
approving designs, testing features, or providing required accounts.

risks:
Include genuine project-specific risks.
Every risk must contain:
- risk
- mitigation

vsNoCode:
Explain specifically why custom development may be better for this project.
Do not use generic claims.

nextSteps:
Provide 3-5 actionable next steps.

CLIENT INFORMATION

Name:
${body.name}

Email:
${body.email}

Project Type:
${body.projectType}

Current Stage:
${body.stage}

Expected Timeline:
${body.timeline}

Budget:
${body.budget ?? "Not specified"}

Project Description:
${body.description}
`;

  console.log(
    JSON.stringify({
      tag: "QUOTE_PROMPT_SIZE",
      characters: prompt.length,
      bytes: Buffer.byteLength(prompt, "utf8"),
    }),
  );

  return prompt;
}