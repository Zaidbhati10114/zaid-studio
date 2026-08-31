import { NextRequest, NextResponse } from "next/server";

import {
    getProviderHealth,
    isProviderAvailable,
} from "@/lib/ai-health/health-service";

const TEST_SECRET =
    process.env.AI_STRESS_TEST_SECRET;

export async function GET(
    req: NextRequest,
) {
    const secret =
        req.headers.get("x-test-secret");

    if (
        !TEST_SECRET ||
        secret !== TEST_SECRET
    ) {
        return NextResponse.json(
            {
                success: false,
                error: "Unauthorized",
            },
            { status: 401 },
        );
    }

    try {
        const groqHealth =
            await getProviderHealth(
                "groq",
                "openai/gpt-oss-20b",
            );

        const groqAvailable =
            await isProviderAvailable(
                "groq",
                "openai/gpt-oss-20b",
            );

        return NextResponse.json({
            success: true,
            groq: {
                health: groqHealth,
                available:
                    groqAvailable,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            },
            { status: 500 },
        );
    }
}