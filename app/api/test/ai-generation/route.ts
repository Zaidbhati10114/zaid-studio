export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { callAIWithFallback } from "@/lib/ai-providers";

const TEST_SECRET = process.env.AI_STRESS_TEST_SECRET;

const TEST_PROMPT = `
Return ONLY valid JSON.

Generate a project proposal using this test information.

Client: System Health Test Client
Project Type: Website
Stage: Starting from scratch
Budget: Under ₹50k
Timeline: 2–4 weeks

Description:
Build a modern responsive website for a small interior design
business with a portfolio, service sections, contact form,
and WhatsApp integration.

Return exactly these fields:

complexity
summary
servicesMatched
estimatedTimeline
estimatedCost
whyHireMe
deliverables
techStack
phases
clientResponsibilities
risks
vsNoCode
nextSteps
`;

export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-test-secret");

    if (!TEST_SECRET || secret !== TEST_SECRET) {
        return NextResponse.json(
            {
                success: false,
                error: "Unauthorized",
            },
            {
                status: 401,
            },
        );
    }

    const startedAt = Date.now();


    try {

        const proposal =
            await callAIWithFallback(
                TEST_PROMPT,

                // {
                //     provider: "groq",
                //     bypassCooldown: true,
                // },
            );
        //throw new Error("INTENTIONAL_HEALTH_TEST_FAILURE");

        return NextResponse.json(
            {
                success: true,
                latencyMs: Date.now() - startedAt,
                proposal,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        const latencyMs = Date.now() - startedAt;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.error(
            JSON.stringify({
                tag: "AI_STRESS_TEST_ERROR",
                latencyMs,
                error: message,
            }),
        );

        return NextResponse.json(
            {
                success: false,
                latencyMs,
                error: message,
            },
            {
                status: 500,
            },
        );
    }
}