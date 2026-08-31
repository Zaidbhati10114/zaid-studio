// app/api/admin/system-health/route.ts

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

// ─── Auth ─────────────────────────────────────────────────────────────────────

function isAuthed(request: NextRequest): boolean {
    const cookie =
        request.cookies.get("admin_session");

    return (
        cookie?.value ===
        process.env.ADMIN_PASSWORD
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type TimeRange =
    | "24h"
    | "7d"
    | "30d"
    | "all";

type ProviderName =
    | "groq"
    | "gemini"
    | "sarvam";

const PROVIDERS: ProviderName[] = [
    "groq",
    "gemini",
    "sarvam",
];

function getRangeStart(
    range: TimeRange,
): Date | null {
    const now = Date.now();

    switch (range) {
        case "24h":
            return new Date(
                now - 24 * 60 * 60 * 1000,
            );

        case "7d":
            return new Date(
                now - 7 * 24 * 60 * 60 * 1000,
            );

        case "30d":
            return new Date(
                now - 30 * 24 * 60 * 60 * 1000,
            );

        case "all":
            return null;
    }
}

function percentile(
    values: number[],
    percentileValue: number,
): number | null {
    if (!values.length) {
        return null;
    }

    const sorted = [...values].sort(
        (a, b) => a - b,
    );

    const index =
        (percentileValue / 100) *
        (sorted.length - 1);

    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
        return sorted[lower];
    }

    const weight = index - lower;

    return Math.round(
        sorted[lower] +
        (sorted[upper] -
            sorted[lower]) *
        weight,
    );
}

function getOverallStatus(
    providers: Array<{
        status: string;
    }>,
): "healthy" | "degraded" | "unavailable" {
    if (
        providers.some(
            (provider) =>
                provider.status ===
                "unavailable",
        )
    ) {
        return "unavailable";
    }

    if (
        providers.some(
            (provider) =>
                provider.status ===
                "degraded",
        )
    ) {
        return "degraded";
    }

    return "healthy";
}

// ─── GET — dashboard data ────────────────────────────────────────────────────

export async function GET(
    request: NextRequest,
) {
    if (!isAuthed(request)) {
        return json(
            {
                error: "Unauthorized",
            },
            401,
        );
    }

    const searchParams =
        request.nextUrl.searchParams;

    const requestedRange =
        searchParams.get("range") as
        | TimeRange
        | null;

    const range: TimeRange =
        requestedRange &&
            [
                "24h",
                "7d",
                "30d",
                "all",
            ].includes(requestedRange)
            ? requestedRange
            : "7d";

    const rangeStart =
        getRangeStart(range);

    try {
        // ─────────────────────────────────────────────────────────
        // 1. Current provider health
        // ─────────────────────────────────────────────────────────

        const {
            data: providerHealthRows,
            error: providerHealthError,
        } = await supabaseAdmin
            .from("ai_provider_health")
            .select("*")
            .order("provider");

        if (providerHealthError) {
            throw providerHealthError;
        }

        const providers = (
            providerHealthRows ?? []
        ).map((row) => ({
            provider:
                row.provider as ProviderName,
            model: row.model,
            status: row.status,

            lastSuccessAt:
                row.last_success_at,
            lastFailureAt:
                row.last_failure_at,

            lastLatencyMs:
                row.last_latency_ms,

            consecutiveFailures:
                row.consecutive_failures,

            rateLimitCount:
                row.rate_limit_count,

            timeoutCount:
                row.timeout_count,

            invalidJsonCount:
                row.invalid_json_count,

            providerErrorCount:
                row.provider_error_count,

            cooldownUntil:
                row.cooldown_until,

            updatedAt:
                row.updated_at,
        }));

        const overallStatus =
            getOverallStatus(providers);

        // ─────────────────────────────────────────────────────────
        // 2. Historical events for selected range
        // ─────────────────────────────────────────────────────────

        let eventsQuery =
            supabaseAdmin
                .from("ai_provider_health_events")
                .select(
                    `
                provider,
                model,
                status,
                latency_ms,
                error_type,
                http_status,
                source,
                request_correlation_id,
                is_fallback,
                created_at
            `,
                )
                .order("created_at", {
                    ascending: false,
                });

        if (rangeStart) {
            eventsQuery =
                eventsQuery.gte(
                    "created_at",
                    rangeStart.toISOString(),
                );
        }

        const {
            data: events,
            error: eventsError,
        } = await eventsQuery;

        if (eventsError) {
            throw eventsError;
        }

        const historicalEvents =
            events ?? [];

        // ─────────────────────────────────────────────────────────
        // 3. User traffic metrics
        // ─────────────────────────────────────────────────────────

        const userEvents =
            historicalEvents.filter(
                (event) =>
                    event.source ===
                    "user_request",
            );

        const requestGroups =
            new Map<
                string,
                typeof userEvents
            >();

        for (const event of userEvents) {
            if (!event.request_correlation_id) {
                continue;
            }

            const existing =
                requestGroups.get(
                    event.request_correlation_id,
                ) ?? [];

            existing.push(event);

            requestGroups.set(
                event.request_correlation_id,
                existing,
            );
        }

        const clientRequests =
            Array.from(
                requestGroups.entries(),
            );

        const fallbackPaths = new Map<
            string,
            number
        >();

        for (const [, events] of clientRequests) {
            const pathProviders = [...events]
                .sort(
                    (a, b) =>
                        new Date(
                            a.created_at,
                        ).getTime() -
                        new Date(
                            b.created_at,
                        ).getTime(),
                )
                .map(
                    (event) => event.provider,
                );

            const hasFallback =
                events.some(
                    (event) =>
                        event.is_fallback === true,
                );

            if (!hasFallback || pathProviders.length < 2) {
                continue;
            }

            const path =
                pathProviders.join(" → ");

            fallbackPaths.set(
                path,
                (fallbackPaths.get(path) ?? 0) + 1,
            );
        }


        const totalClientRequests =
            clientRequests.length;

        const successfulClientRequests =
            clientRequests.filter(
                ([, events]) =>
                    events.some(
                        (event) =>
                            event.status === "success",
                    ),
            ).length;

        const fallbackRequests =
            clientRequests.filter(
                ([, events]) =>
                    events.some(
                        (event) =>
                            event.is_fallback === true,
                    ),
            ).length;

        const failedClientRequests =
            clientRequests.filter(
                ([, events]) =>
                    !events.some(
                        (event) =>
                            event.status === "success",
                    ),
            ).length;

        const fallbackRate =
            totalClientRequests > 0
                ? Number(
                    (
                        (fallbackRequests /
                            totalClientRequests) *
                        100
                    ).toFixed(2),
                )
                : null;

        const primaryAttemptSuccessRate =
            totalClientRequests > 0
                ? Number(
                    (
                        ((totalClientRequests -
                            fallbackRequests -
                            failedClientRequests) /
                            totalClientRequests) *
                        100
                    ).toFixed(2),
                )
                : null;



        const totalRequests =
            userEvents.length;

        const successfulRequests =
            userEvents.filter(
                (event) =>
                    event.status ===
                    "success",
            ).length;

        const failedRequests =
            userEvents.filter(
                (event) =>
                    event.status ===
                    "failed",
            ).length;

        const latencies =
            userEvents
                .map(
                    (event) =>
                        event.latency_ms,
                )
                .filter(
                    (
                        value,
                    ): value is number =>
                        typeof value ===
                        "number" &&
                        value >= 0,
                );

        const averageLatency =
            latencies.length
                ? Math.round(
                    latencies.reduce(
                        (sum, value) =>
                            sum + value,
                        0,
                    ) /
                    latencies.length,
                )
                : null;

        const p95Latency =
            percentile(
                latencies,
                95,
            );

        const successRate =
            totalRequests > 0
                ? Number(
                    (
                        (successfulRequests /
                            totalRequests) *
                        100
                    ).toFixed(2),
                )
                : null;

        const rateLimitErrors =
            userEvents.filter(
                (event) =>
                    event.error_type ===
                    "rate_limit",
            ).length;

        const timeoutErrors =
            userEvents.filter(
                (event) =>
                    event.error_type ===
                    "timeout",
            ).length;

        const invalidJsonErrors =
            userEvents.filter(
                (event) =>
                    event.error_type ===
                    "invalid_json",
            ).length;

        const providerErrors =
            userEvents.filter(
                (event) =>
                    event.error_type ===
                    "provider_error",
            ).length;

        const authenticationErrors =
            userEvents.filter(
                (event) =>
                    event.error_type ===
                    "authentication_error",
            ).length;

        const invalidRequestErrors =
            userEvents.filter(
                (event) =>
                    event.error_type ===
                    "invalid_request",
            ).length;

        // ─────────────────────────────────────────────────────────
        // 4. Provider usage / comparison
        // ─────────────────────────────────────────────────────────

        const providerUsage =
            PROVIDERS.map(
                (provider) => {
                    const providerEvents =
                        userEvents.filter(
                            (event) =>
                                event.provider ===
                                provider,
                        );

                    const successful =
                        providerEvents.filter(
                            (event) =>
                                event.status ===
                                "success",
                        ).length;

                    const failed =
                        providerEvents.filter(
                            (event) =>
                                event.status ===
                                "failed",
                        ).length;

                    const providerLatencies =
                        providerEvents
                            .map(
                                (event) =>
                                    event.latency_ms,
                            )
                            .filter(
                                (
                                    value,
                                ): value is number =>
                                    typeof value ===
                                    "number" &&
                                    value >= 0,
                            );

                    const providerAverage =
                        providerLatencies.length
                            ? Math.round(
                                providerLatencies.reduce(
                                    (
                                        sum,
                                        value,
                                    ) =>
                                        sum +
                                        value,
                                    0,
                                ) /
                                providerLatencies.length,
                            )
                            : null;

                    const usagePercent =
                        totalRequests > 0
                            ? Number(
                                (
                                    (providerEvents.length /
                                        totalRequests) *
                                    100
                                ).toFixed(2),
                            )
                            : 0;

                    return {
                        provider,
                        requests:
                            providerEvents.length,
                        usagePercent,
                        successful,
                        failed,

                        successRate:
                            providerEvents.length >
                                0
                                ? Number(
                                    (
                                        (successful /
                                            providerEvents.length) *
                                        100
                                    ).toFixed(
                                        2,
                                    ),
                                )
                                : null,

                        averageLatency:
                            providerAverage,

                        p95Latency:
                            percentile(
                                providerLatencies,
                                95,
                            ),

                        rateLimitErrors:
                            providerEvents.filter(
                                (event) =>
                                    event.error_type ===
                                    "rate_limit",
                            ).length,

                        timeoutErrors:
                            providerEvents.filter(
                                (event) =>
                                    event.error_type ===
                                    "timeout",
                            ).length,

                        invalidJsonErrors:
                            providerEvents.filter(
                                (event) =>
                                    event.error_type ===
                                    "invalid_json",
                            ).length,
                    };
                },
            );

        // ─────────────────────────────────────────────────────────
        // 5. Recent alerts / problems
        // ─────────────────────────────────────────────────────────

        const recentProblemEvents =
            historicalEvents
                .filter(
                    (event) =>
                        event.status ===
                        "failed" ||
                        event.error_type !==
                        null,
                )
                .slice(0, 20)
                .map((event) => ({
                    provider:
                        event.provider,
                    model:
                        event.model,
                    errorType:
                        event.error_type,
                    httpStatus:
                        event.http_status,
                    latencyMs:
                        event.latency_ms,
                    source:
                        event.source,
                    createdAt:
                        event.created_at,
                }));

        // ─────────────────────────────────────────────────────────
        // 6. Latest / recent health-check runs
        // ─────────────────────────────────────────────────────────

        const {
            data: recentRuns,
            error: runsError,
        } = await supabaseAdmin
            .from("ai_health_check_runs")
            .select("*")
            .order("started_at", {
                ascending: false,
            })
            .limit(20);

        if (runsError) {
            throw runsError;
        }

        const latestRun =
            recentRuns?.[0] ?? null;

        const latestManualRun =
            recentRuns?.find(
                (run) =>
                    run.source ===
                    "manual_health_check",
            ) ?? null;

        const latestScheduledRun =
            recentRuns?.find(
                (run) =>
                    run.source ===
                    "scheduled_health_check",
            ) ?? null;

        // ─────────────────────────────────────────────────────────
        // 7. Health-check statistics
        // ─────────────────────────────────────────────────────────

        const healthCheckRuns =
            recentRuns ?? [];

        const averageRunDuration =
            healthCheckRuns.length === 0
                ? null
                : Math.round(
                    healthCheckRuns.reduce(
                        (sum, run) =>
                            sum + run.duration_ms,
                        0,
                    ) / healthCheckRuns.length,
                );

        const fastestRun =
            healthCheckRuns.length === 0
                ? null
                : [...healthCheckRuns].sort(
                    (a, b) =>
                        a.duration_ms - b.duration_ms,
                )[0];

        const slowestRun =
            healthCheckRuns.length === 0
                ? null
                : [...healthCheckRuns].sort(
                    (a, b) =>
                        b.duration_ms - a.duration_ms,
                )[0];

        const providerTrend = providers.map(
            (provider) => {
                const usage = providerUsage.find(
                    (item) =>
                        item.provider ===
                        provider.provider,
                );

                const healthEvents = userEvents
                    .filter(
                        (event) => event.provider === provider.provider,
                    )
                    .sort(
                        (a, b) =>
                            new Date(a.created_at).getTime() -
                            new Date(b.created_at).getTime(),
                    );

                const lastFive =
                    healthEvents.slice(-5);

                const healthyCount =
                    lastFive.filter(
                        (event) =>
                            event.status === "success",
                    ).length;

                return {
                    provider: provider.provider,
                    healthScore:
                        lastFive.length === 0
                            ? null
                            : Math.round(
                                (healthyCount /
                                    lastFive.length) *
                                100,
                            ),
                    recentRequests:
                        usage?.requests ?? 0,
                };
            },
        );

        const completedRuns =
            healthCheckRuns.filter(
                (run) =>
                    run.status ===
                    "completed",
            );

        const failedRuns =
            healthCheckRuns.filter(
                (run) =>
                    run.status ===
                    "failed",
            );

        const fullyHealthyRuns =
            completedRuns.filter(
                (run) =>
                    run.providers_failed ===
                    0 &&
                    run.telemetry_errors ===
                    0,
            );


        const insights: Array<{
            id: string;
            type:
            | "good"
            | "warning"
            | "info";
            title: string;
            description: string;
        }> = [];

        /* ---------- Provider reliability ---------- */

        const weakestProvider =
            [...providerTrend]
                .filter(
                    (provider) =>
                        provider.healthScore !==
                        null,
                )
                .sort(
                    (a, b) =>
                        (a.healthScore ?? 0) -
                        (b.healthScore ?? 0),
                )[0];

        if (
            weakestProvider &&
            (weakestProvider.healthScore ??
                100) < 100
        ) {
            insights.push({
                id: "provider-health",
                type: "warning",
                title: `${weakestProvider.provider} required a recent fallback`,
                description: `Health score is ${weakestProvider.healthScore}% based on recent production requests.`,
            });
        }

        /* ---------- Slowest provider ---------- */

        const slowestProvider =
            providers.reduce(
                (slowest, provider) => {
                    if (
                        provider.lastLatencyMs ===
                        null
                    )
                        return slowest;

                    if (
                        !slowest ||
                        provider.lastLatencyMs >
                        slowest.lastLatencyMs
                    )
                        return provider;

                    return slowest;
                },
                null as (typeof providers)[number] | null,
            );

        if (
            slowestProvider &&
            slowestProvider.lastLatencyMs
        ) {
            insights.push({
                id: "slowest-provider",
                type: "info",
                title: `${slowestProvider.provider} is currently the slowest provider`,
                description: `Latest response took ${Math.round(slowestProvider.lastLatencyMs)}ms.`,
            });
        }

        /* ---------- Health-check stability ---------- */

        if (
            healthCheckRuns.length > 0 &&
            failedRuns.length === 0
        ) {
            insights.push({
                id: "stable-health-checks",
                type: "good",
                title: "Health checks are stable",
                description: `All ${healthCheckRuns.length} health-check runs completed successfully.`,
            });
        }

        /* ---------- Traffic concentration ---------- */

        const busiestProvider =
            [...providerUsage].sort(
                (a, b) =>
                    b.requests - a.requests,
            )[0];

        if (busiestProvider) {
            insights.push({
                id: "traffic-share",
                type: "info",
                title: `${busiestProvider.provider} handles most production traffic`,
                description: `${busiestProvider.usagePercent}% of provider attempts currently go through ${busiestProvider.provider}.`,
            });
        }

        /* ---------- Fastest run ---------- */

        if (fastestRun) {
            insights.push({
                id: "fastest-run",
                type: "good",
                title: "Fastest health check completed quickly",
                description: `The quickest full system check finished in ${Math.round(fastestRun.duration_ms / 1000)} seconds.`,
            });
        }

        // ─────────────────────────────────────────────────────────
        // 8. Response
        // ─────────────────────────────────────────────────────────

        return json({
            success: true,
            insights,
            range,

            overview: {
                status: overallStatus,

                totalRequests,
                successfulRequests,
                failedRequests,

                successRate,

                averageLatency,
                p95Latency,

                totalClientRequests,
                successfulClientRequests,
                failedClientRequests,
                fallbackRequests,
                fallbackRate,

                primaryAttemptSuccessRate,

                rateLimitErrors,
                timeoutErrors,
                invalidJsonErrors,
                providerErrors,
                authenticationErrors,
                invalidRequestErrors,
            },

            providers,

            providerUsage,

            fallbackPaths: Array.from(
                fallbackPaths.entries(),
            ).map(([path, count]) => ({
                path,
                count,
            })),

            performance: {
                averageRunDuration,
                fastestRun,
                slowestRun,
                providerTrend,
            },

            alerts: {
                count:
                    recentProblemEvents.length,
                items:
                    recentProblemEvents,
            },

            runs: {
                latest: latestRun,

                latestManual:
                    latestManualRun,

                latestScheduled:
                    latestScheduledRun,

                recent:
                    healthCheckRuns,

                statistics: {
                    total:
                        healthCheckRuns.length,
                    completed:
                        completedRuns.length,
                    failed:
                        failedRuns.length,
                    fullyHealthy:
                        fullyHealthyRuns.length,
                },
            },

            generatedAt:
                new Date().toISOString(),
        });
    } catch (error) {
        console.error(
            JSON.stringify({
                tag:
                    "ADMIN_SYSTEM_HEALTH_READ_ERROR",
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            }),
        );

        return json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load system health",
            },
            500,
        );
    }
}