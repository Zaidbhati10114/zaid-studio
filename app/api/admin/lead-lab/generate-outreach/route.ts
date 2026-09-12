import { NextRequest } from "next/server";

import { callAIWithFallback } from "@/lib/validation/ai-providers";
import {
    getOutreach,
    saveOutreach,
} from "@/lib/lead-search/outreach-repository";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.campaignLeadId) {
            return Response.json(
                {
                    success: false,
                    error: "campaignLeadId is required.",
                },
                { status: 400 },
            );
        }

        // Return cached outreach if it exists.
        const cached = await getOutreach(body.campaignLeadId);

        if (cached) {
            return Response.json({
                success: true,
                cached: true,
                outreach: {
                    email: {
                        subject: cached.email_subject,
                        body: cached.email_body,
                    },
                    whatsapp: cached.whatsapp,
                    linkedin: cached.linkedin,
                },
            });
        }

        const prompt = `
Generate outreach for this business.

Business:
${body.businessName}

Category:
${body.category}

City:
${body.city}

Website findings:
${JSON.stringify(body.websiteFindings, null, 2)}

Outreach angle:
${body.outreachAngle}

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

        const outreach = await callAIWithFallback<{
            email: {
                subject: string;
                body: string;
            };
            whatsapp: string;
            linkedin: string;
        }>(prompt, {
            task: "proposal_generation",
        });

        await saveOutreach({
            campaignLeadId: body.campaignLeadId,
            emailSubject: outreach.email.subject,
            emailBody: outreach.email.body,
            whatsapp: outreach.whatsapp,
            linkedin: outreach.linkedin,
        });

        return Response.json({
            success: true,
            cached: false,
            outreach,
        });
    } catch (error) {
        return Response.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Outreach generation failed.",
            },
            { status: 500 },
        );
    }
}