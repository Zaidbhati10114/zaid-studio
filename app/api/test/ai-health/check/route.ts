import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    runProviderHealthCheck,
} from "@/lib/ai-health/health-check";

const TEST_SECRET =
    process.env.AI_STRESS_TEST_SECRET;

export const runtime = "nodejs";

export async function POST(
    req: NextRequest,
) {
    const secret =
        req.headers.get(
            "x-test-secret",
        );

    if (
        !TEST_SECRET ||
        secret !== TEST_SECRET
    ) {
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
        const results =
            await runProviderHealthCheck('manual_health_check');

        return NextResponse.json({
            success: true,
            totalLatencyMs:
                Date.now() - startedAt,
            results,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                totalLatencyMs:
                    Date.now() - startedAt,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            },
            {
                status: 500,
            },
        );
    }
}