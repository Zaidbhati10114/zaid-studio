export const QUOTE_BENCHMARK = {
    prompt: `
Return ONLY valid JSON.

Generate a project quote for a restaurant website.

The response must be JSON with this structure:

{
  "projectQuote": {
    "projectName": "...",
    "projectScope": [],
    "summary": {
      "totalAmount": 0
    },
    "timeline": {
      "duration": "..."
    }
  }
}
`,
};

export const PROPOSAL_BENCHMARK = {
    prompt: `
Return ONLY valid JSON.

Generate a project proposal.

The response must be JSON with this structure:

{
  "proposal": {
    "summary": "...",
    "estimatedTimeline": "...",
    "estimatedCost": "...",
    "deliverables": [],
    "techStack": [],
    "phases": [],
    "risks": [],
    "nextSteps": []
  }
}
`,
};