// lib/ai/quote-prompt.ts

import { QuoteRequestBody } from "../types";
import { STUDIO_CONTEXT } from "./agency-context";



export function buildQuotePrompt(body: QuoteRequestBody): string {
    return `
${STUDIO_CONTEXT}

You are preparing an INITIAL project estimate for a potential client.

Your objective is to help the client understand:

- what they're trying to build
- how complex it is
- roughly how long it will take
- an estimated investment
- what technologies are appropriate
- what deliverables they will receive
- what risks exist
- what information you will need from them

The proposal should feel practical, realistic and easy to understand.

Never exaggerate timelines, pricing or capabilities.

Respond ONLY with valid JSON.

Use EXACTLY this structure:

{
  "complexity": "Simple" | "Medium" | "Complex",
  "summary": "Explain the project in 1-2 concise sentences using simple language.",
  "servicesMatched": [
    "Service 1",
    "Service 2"
  ],
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

Rules:

GENERAL

- Return valid JSON only.
- No markdown.
- No explanations outside JSON.
- Keep the proposal client-friendly.
- Avoid unnecessary technical jargon.

COMPLEXITY

- Simple → Landing pages, brochure websites, small business sites.
- Medium → Dashboards, portals, booking systems, admin panels.
- Complex → SaaS platforms, marketplaces, mobile apps, AI products.

SUMMARY

- Explain what the client is building.
- Mention their business goal.
- Maximum 2 short paragraphs.

SERVICES MATCHED

Only include services that genuinely apply.

Examples:

- Landing Page
- Website Development
- Web Application
- SaaS Development
- AI Integration
- API Development
- Dashboard Development
- CMS Integration
- Booking System
- Payment Integration

TIMELINE

Provide realistic development timelines.

COST

Estimate in Indian Rupees.

Price should reflect:

- complexity
- requested features
- timeline
- project scope

DELIVERABLES

Must be project-specific.

Do NOT generate generic deliverables.

TECH STACK

Recommend only technologies appropriate for the project.

Do not recommend technologies unrelated to the requirements.

PHASES

Generate realistic phases.

Example:

Discovery

Design

Development

Testing

Deployment

Support

Each phase should contain realistic tasks.

CLIENT RESPONSIBILITIES

Generate practical responsibilities such as:

- providing branding assets
- approving designs
- supplying content
- testing features
- purchasing domain if required

RISKS

Generate genuine project risks.

Each risk must include a practical mitigation.

VS NO CODE

Explain specifically why custom development is better for THIS project.

Do not use generic statements.

NEXT STEPS

Generate 3-5 actionable next steps.

Example:

- Review proposal
- Schedule discovery call
- Finalize scope
- Approve quotation
- Begin project kickoff

----------------------------------------

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
}