import { NextRequest, NextResponse } from "next/server";

import { createApproachLead } from "@/lib/lead-search/approach-lead-repository";
import { createApproachMessage } from "@/lib/lead-search/approach-message-repository";
import { getApproachLeads } from "@/lib/lead-search/approach-lead-repository";
import { generateApproachMessage } from "@/lib/lead-search/approach-message-service";

export async function GET() {
    try {
        const leads = await getApproachLeads();

        return NextResponse.json({
            success: true,
            leads,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load approach leads.",
            },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const businessName =
            typeof body.businessName === "string"
                ? body.businessName.trim()
                : "";

        const businessDetails =
            typeof body.businessDetails === "string"
                ? body.businessDetails.trim()
                : "";

        const extraNotes =
            typeof body.extraNotes === "string"
                ? body.extraNotes.trim()
                : null;

        const hasWebsite = body.hasWebsite === true;

        if (!businessName) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Business name is required.",
                },
                { status: 400 },
            );
        }

        if (!businessDetails) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Business details are required.",
                },
                { status: 400 },
            );
        }

        const lead = await createApproachLead({
            businessName,
            businessDetails,
            hasWebsite,
            extraNotes,
        });

        try {
            const content = await generateApproachMessage({
                businessName,
                businessDetails,
                hasWebsite,
                extraNotes,
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
                            : "Approach message generation failed.",
                    lead,
                },
                { status: 500 },
            );
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create approach lead.",
            },
            { status: 500 },
        );
    }
}