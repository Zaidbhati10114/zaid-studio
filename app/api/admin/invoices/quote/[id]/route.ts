import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
        .from("quotes")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        return NextResponse.json(
            {
                success: false,
                error: "Quote not found.",
            },
            { status: 404 }
        );
    }

    return NextResponse.json({
        success: true,
        quote: {
            id: data.id,

            clientName: data.name,
            clientEmail: data.email,
            company: data.company ?? "",

            projectType: data.project_type,
            summary: data.summary,

            estimatedCost: data.estimated_cost,
            estimatedTimeline: data.estimated_timeline,
            complexity: data.complexity,

            deliverables: data.deliverables ?? [],
            techStack: data.tech_stack ?? [],
            phases: data.phases ?? [],

            clientResponsibilities:
                data.client_responsibilities ?? [],

            risks: data.risks ?? [],
            nextSteps: data.next_steps ?? [],

            quoteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/quote/${data.id}`,
        },
    });
}