import { NextRequest, NextResponse } from "next/server";

import {
    APPROACH_LEAD_STATUSES,
    updateApproachLeadStatus,
    type ApproachLeadStatus,
} from "@/lib/lead-search/approach-lead-repository";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const status =
            typeof body.status === "string"
                ? body.status.trim()
                : "";

        if (!APPROACH_LEAD_STATUSES.includes(
            status as ApproachLeadStatus,
        )) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid approach lead status.",
                    allowedStatuses: APPROACH_LEAD_STATUSES,
                },
                { status: 400 },
            );
        }

        const lead = await updateApproachLeadStatus({
            id,
            status: status as ApproachLeadStatus,
        });

        return NextResponse.json({
            success: true,
            lead,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update approach lead status.",
            },
            { status: 500 },
        );
    }
}