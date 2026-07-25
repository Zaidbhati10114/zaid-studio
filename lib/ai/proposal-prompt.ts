import { STUDIO_CONTEXT } from "./agency-context";
import type { ProposalGenerationInput } from "@/lib/types";

export function buildProposalPrompt(
  input: ProposalGenerationInput
): string {

  return `
${STUDIO_CONTEXT}

You are preparing the FINAL client proposal.

The proposal will be sent directly to the client.
Client Name:
Client Name:
${input.clientName}

Project Type:
${input.projectType}

Your job is NOT to create a new estimate.

Your job is to improve an existing estimate into a polished,
professional proposal suitable for presentation.

The proposal should help the client feel confident in moving forward.

Focus on communicating value, clarity and professionalism.

Do not use exaggerated marketing language.

Do not make guarantees that cannot be fulfilled.

Unless meeting notes explicitly require a change, preserve the original pricing, timeline, deliverables and project scope.

Meeting notes may refine the proposal.

Do not remove requested functionality unless the meeting notes explicitly require it.

Do not significantly change pricing or timelines unless the meeting notes justify those changes.

Improve only:

- clarity
- professionalism
- structure
- readability
- client confidence

Do not increase the project scope.
Never invent additional features.
If meeting notes conflict with the original estimate, prioritize the meeting notes.

If meeting notes do not mention a section, preserve the original estimate.
Do not remove agreed functionality.

Do not introduce unnecessary technical complexity.

Never exaggerate.



Never invent technologies not appropriate for the project.

Return ONLY valid JSON.

Do not wrap the response in markdown.

Do not use triple backticks.

Do not include explanations before or after the JSON.

The response must exactly match the following structure:

{
  "summary": "...",

  "estimatedTimeline": "...",

  "estimatedCost": "...",

  "complexity": "...",

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

  "nextSteps": []
}

Original Estimate:

Project Type:
${input.projectType}

Project Description:
${input.description}

Summary:
${input.summary}

Timeline:
${input.estimatedTimeline}

Estimated Cost:
${input.estimatedCost}

Complexity:
${input.complexity}

Deliverables:
${JSON.stringify(input.deliverables, null, 2)}

Tech Stack:
${JSON.stringify(input.techStack, null, 2)}

Phases:
${JSON.stringify(input.phases, null, 2)}

Client Responsibilities:
${JSON.stringify(input.clientResponsibilities, null, 2)}

Risks:
${JSON.stringify(input.risks, null, 2)}

Next Steps:
${JSON.stringify(input.nextSteps, null, 2)}

Meeting Notes

${input.adminNotes ?? "No additional meeting notes were provided. Use the original estimate without modification."}
Generate Version 2 of this proposal.

The final proposal should feel polished, professional and ready to send directly to the client.

Keep the agreed scope unless meeting notes explicitly require changes.

Return only valid JSON.
`;
}