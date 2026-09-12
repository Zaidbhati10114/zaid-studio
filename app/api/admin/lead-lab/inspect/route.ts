import { NextRequest } from "next/server";

import { deepInspect } from "@/lib/lead-search/ai-inspector";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.businessId) {
            return Response.json(
                {
                    success: false,
                    error: "businessId is required.",
                },
                { status: 400 },
            );
        }

        // Load business from DB
        const { data: business, error } = await supabaseAdmin
            .from("business_directory")
            .select("*")
            .eq("id", body.businessId)
            .single();

        if (error || !business) {
            return Response.json(
                {
                    success: false,
                    error: "Business not found.",
                },
                { status: 404 },
            );
        }

        // deepInspect now handles:
        // 1. Cache lookup
        // 2. AI generation (if needed)
        // 3. Saving inspection
        const inspection = await deepInspect({
            id: business.id,
            name: business.name,
            primaryType: business.primary_type,

            city: business.city ?? "",
            address: business.address ?? "",

            rating: business.rating,
            reviewCount: business.review_count,

            website: business.website,
            phone: business.phone,
        });

        return Response.json({
            success: true,
            inspection,
        });
    } catch (error) {
        return Response.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Inspection failed.",
            },
            { status: 500 },
        );
    }
}