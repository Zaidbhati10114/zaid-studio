import { NextRequest, NextResponse } from "next/server";

import { getApproachLead } from "@/lib/lead-search/approach-lead-repository";
import { createApproachMessage } from "@/lib/lead-search/approach-message-repository";
import { generateApproachMessage } from "@/lib/lead-search/approach-message-service";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const lead = await getApproachLead(id);

        const content = await generateApproachMessage({
            businessName: lead.business_name,
            businessDetails: lead.business_details,
            hasWebsite: lead.has_website,
            extraNotes: lead.extra_notes,
        });

        const message = await createApproachMessage({
            approachLeadId: lead.id,
            content,
        });

        return NextResponse.json({
            success: true,
            lead,
            message,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to regenerate approach message.",
            },
            { status: 500 },
        );
    }
}