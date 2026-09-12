import { WebsiteEvidence } from "./html-extractor";

export interface OutreachInput {
    businessName: string;

    category: string | null;

    city?: string;

    evidence: WebsiteEvidence;

    websiteFindings: string[];

    outreachAngle: string;
}

export function buildOutreachPrompt(
    input: OutreachInput,
) {
    return `
Write personalized outreach for a local business.

Business:
${input.businessName}

Category:
${input.category}

Website Evidence:
${JSON.stringify(input.evidence, null, 2)}

Website Findings:
${input.websiteFindings.join("\n")}

Primary Opportunity:
${input.outreachAngle}

Return JSON only.

{
 "email":{
   "subject":"...",
   "body":"..."
 },
 "whatsapp":"...",
 "linkedin":"..."
}
`;
}