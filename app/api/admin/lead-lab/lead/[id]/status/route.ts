import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

const ALLOWED_STATUSES = [
    "new",
    "contacted",
    "replied",
    "won",
    "lost",
] as const;

type LeadStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (!ALLOWED_STATUSES.includes(body.status)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid status.",
                },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("campaign_leads")
            .update({
                status: body.status as LeadStatus,
            })
            .eq("id", id)
            .select("id,status")
            .single();

        if (error) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            lead: data,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update lead.",
            },
            { status: 500 }
        );
    }
}