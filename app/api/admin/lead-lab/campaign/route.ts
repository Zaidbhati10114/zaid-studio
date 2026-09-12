import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// GET - List campaigns
export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("lead_campaigns")
        .select(`
      id,
      name,
      city,
      niche,
      created_at,
      status,
      imported_count
    `)
        .order("created_at", { ascending: false });

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
        campaigns: data ?? [],
    });
}

// POST - Create campaign
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            name,
            city,
            niche,
            radius = 5,
            maxResults = 20,
        } = body;

        if (!name || !city || !niche) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Campaign name, city and niche are required.",
                },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("lead_campaigns")
            .insert({
                name,
                city,
                niche,
                radius_km: radius,
                max_results: maxResults,
                status: "draft",
                imported_count: 0,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            campaign: data,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create campaign.",
            },
            { status: 500 }
        );
    }
}