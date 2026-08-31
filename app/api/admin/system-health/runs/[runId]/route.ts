import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

function isAuthed(request: NextRequest): boolean {
    const cookie = request.cookies.get("admin_session");
    return cookie?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ runId: string }> }
) {
    if (!isAuthed(request)) {
        return json({ error: "Unauthorized" }, 401);
    }

    const { runId } = await params;

    try {
        // ------------------------------------------------------------------
        // Current run
        // ------------------------------------------------------------------

        const { data: run, error: runError } = await supabaseAdmin
            .from("ai_health_check_runs")
            .select("*")
            .eq("run_id", runId)
            .single();

        if (runError || !run) {
            return json({ error: "Run not found" }, 404);
        }

        // ------------------------------------------------------------------
        // Previous run
        // ------------------------------------------------------------------

        const { data: previousRun } = await supabaseAdmin
            .from("ai_health_check_runs")
            .select("*")
            .lt("started_at", run.started_at)
            .order("started_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        // ------------------------------------------------------------------
        // Current run events
        // ------------------------------------------------------------------

        const { data: events, error: eventsError } = await supabaseAdmin
            .from("ai_provider_health_events")
            .select("*")
            .eq("run_id", runId)
            .order("created_at", { ascending: true });

        if (eventsError) {
            throw eventsError;
        }

        const currentEvents = events ?? [];

        // ------------------------------------------------------------------
        // Previous run events
        // ------------------------------------------------------------------

        let previousEvents: any[] = [];

        if (previousRun) {
            const { data } = await supabaseAdmin
                .from("ai_provider_health_events")
                .select("*")
                .eq("run_id", previousRun.run_id);

            previousEvents = data ?? [];
        }

        // ------------------------------------------------------------------
        // Provider comparison
        // ------------------------------------------------------------------

        const providerComparison = currentEvents.map((current) => {
            const previous = previousEvents.find(
                (event) => event.provider === current.provider
            );

            return {
                provider: current.provider,
                currentLatency: current.latency_ms,
                previousLatency: previous?.latency_ms ?? null,
                deltaMs: previous
                    ? current.latency_ms - previous.latency_ms
                    : null,
                deltaPercent: previous
                    ? Math.round(
                        ((current.latency_ms - previous.latency_ms) /
                            previous.latency_ms) *
                        100
                    )
                    : null,
            };
        });

        // ------------------------------------------------------------------
        // Summary
        // ------------------------------------------------------------------

        const fastestProvider =
            currentEvents.length > 0
                ? [...currentEvents].sort(
                    (a, b) => a.latency_ms - b.latency_ms
                )[0]
                : null;

        const slowestProvider =
            currentEvents.length > 0
                ? [...currentEvents].sort(
                    (a, b) => b.latency_ms - a.latency_ms
                )[0]
                : null;

        const averageLatency =
            currentEvents.length > 0
                ? Math.round(
                    currentEvents.reduce(
                        (sum, event) => sum + event.latency_ms,
                        0
                    ) / currentEvents.length
                )
                : null;

        // ------------------------------------------------------------------
        // Response
        // ------------------------------------------------------------------

        return json({
            success: true,

            run,

            events: currentEvents,

            summary: {
                fastestProvider,
                slowestProvider,
                averageLatency,
            },

            comparison: previousRun
                ? {
                    previousRun,

                    durationDelta:
                        run.duration_ms - previousRun.duration_ms,

                    durationDeltaPercent: Math.round(
                        ((run.duration_ms - previousRun.duration_ms) /
                            previousRun.duration_ms) *
                        100
                    ),

                    providers: providerComparison,
                }
                : null,
        });
    } catch (error) {
        console.error({
            tag: "RUN_DETAILS_ERROR",
            runId,
            error,
        });

        return json(
            { error: "Internal server error" },
            500
        );
    }
}