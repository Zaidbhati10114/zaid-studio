import { NextRequest, NextResponse } from "next/server";
import { buildSalesStrategyPrompt } from "@/lib/lead-search/sales-strategy-prompt";
import { callAIWithFallback } from "@/lib/validation/ai-providers";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const prompt = buildSalesStrategyPrompt({
        name: body.name,
        category: body.category,
        city: body.city,
        address: body.address,
        rating: body.rating,
        reviewCount: body.reviewCount,
        phone: body.phone,
        website: body.website,
        renderer: body.renderer ?? "static",
        evidence: body.evidence,
    });

    const result = await callAIWithFallback(prompt, {
        task: "lead_inspection",
    });

    return NextResponse.json({
        prompt,
        result,
    });
}