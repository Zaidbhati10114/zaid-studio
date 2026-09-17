import { NextRequest } from "next/server";
import { runProviderHealthCheck } from "@/lib/ai-health/health-check";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

// ─── Auth check (Manual + Cron) ──────────────────────────────────────────────

function isAuthed(request: NextRequest): boolean {
    const cookie = request.cookies.get("admin_session");

    if (cookie?.value === process.env.ADMIN_PASSWORD) {
        return true;
    }

    const authHeader = request.headers.get("authorization");

    if (
        authHeader &&
        process.env.CRON_SECRET &&
        authHeader === `Bearer ${process.env.CRON_SECRET}`
    ) {
        return true;
    }

    return false;
}

// ─── POST — Run system health check ──────────────────────────────────────────

export async function POST(request: NextRequest) {
    if (!isAuthed(request)) {
        return json({ error: "Unauthorized" }, 401);
    }

    const isCron =
        request.headers.get("authorization") ===
        `Bearer ${process.env.CRON_SECRET}`;

    try {
        const result = await runProviderHealthCheck(
            isCron ? "scheduled_health_check" : "manual_health_check"
        );

        return json({
            success: true,
            runId: result.runId,
            source: result.source,
            status: result.status,
            durationMs: result.durationMs,
            results: result.results,
        });
    } catch (error) {
        console.error(
            JSON.stringify({
                tag: "ADMIN_SYSTEM_HEALTH_CHECK_ERROR",
                error: error instanceof Error ? error.message : String(error),
            })
        );

        return json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "System health check failed",
            },
            500
        );
    }
}