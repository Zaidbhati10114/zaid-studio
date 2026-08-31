// lib/ai-health/repository.ts

import { supabaseAdmin } from "@/lib/supabase-server";


import type {
    AIHealthCheckRun,
    AIHealthEvent,
    AIHealthProvider,
    AIProviderHealth,
} from "./types";

/**
 * Persist a single AI provider health event.
 *
 * This function should never be allowed to break
 * the AI generation flow.
 */
export async function saveAIHealthEvent(
    event: AIHealthEvent,
): Promise<boolean> {
    try {
        const { error } =
            await supabaseAdmin
                .from("ai_provider_health_events")
                .insert({
                    provider: event.provider,
                    model: event.model,
                    status: event.status,
                    latency_ms: event.latencyMs,
                    error_type: event.errorType,
                    http_status: event.httpStatus,
                    request_id: event.requestId,
                    source: event.source,
                    run_id: event.runId,
                    request_correlation_id:
                        event.requestCorrelationId,
                    is_fallback:
                        event.isFallback,
                    created_at: event.createdAt,
                });

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error(
            JSON.stringify({
                tag: "AI_HEALTH_REPOSITORY_ERROR",
                provider: event.provider,
                model: event.model,
                runId: event.runId,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            }),
        );

        return false;
    }
}

export async function createAIHealthCheckRun(
    run: AIHealthCheckRun,
): Promise<void> {
    try {
        const { error } =
            await supabaseAdmin
                .from("ai_health_check_runs")
                .insert({
                    run_id: run.runId,
                    source: run.source,
                    status: run.status,
                    started_at: run.startedAt,
                    completed_at:
                        run.completedAt,
                    duration_ms:
                        run.durationMs,
                    providers_tested:
                        run.providersTested,
                    providers_passed:
                        run.providersPassed,
                    providers_failed:
                        run.providersFailed,

                    // NEW
                    telemetry_errors:
                        run.telemetryErrors,
                });

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error(
            JSON.stringify({
                tag:
                    "AI_HEALTH_RUN_CREATE_ERROR",
                runId: run.runId,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            }),
        );
    }
}

export async function upsertAIProviderHealth(
    health: AIProviderHealth,
): Promise<void> {
    try {
        const { error } = await supabaseAdmin
            .from("ai_provider_health")
            .upsert(
                {
                    provider: health.provider,
                    model: health.model,
                    status: health.status,
                    last_success_at:
                        health.lastSuccessAt,
                    last_failure_at:
                        health.lastFailureAt,
                    last_latency_ms:
                        health.lastLatencyMs,
                    consecutive_failures:
                        health.consecutiveFailures,
                    rate_limit_count:
                        health.rateLimitCount,
                    timeout_count:
                        health.timeoutCount,
                    invalid_json_count:
                        health.invalidJsonCount,
                    provider_error_count:
                        health.providerErrorCount,
                    cooldown_until:
                        health.cooldownUntil,
                    updated_at:
                        health.updatedAt,
                },
                {
                    onConflict:
                        "provider,model",
                },
            );

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error(
            JSON.stringify({
                tag:
                    "AI_PROVIDER_HEALTH_UPSERT_ERROR",
                provider:
                    health.provider,
                model:
                    health.model,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            }),
        );
    }
}

export async function getAIProviderHealth(
    provider: AIHealthProvider,
    model: string,
): Promise<AIProviderHealth | null> {
    try {
        const { data, error } =
            await supabaseAdmin
                .from("ai_provider_health")
                .select("*")
                .eq("provider", provider)
                .eq("model", model)
                .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return null;
        }

        return {
            provider: data.provider,
            model: data.model,
            status: data.status,

            lastSuccessAt:
                data.last_success_at,

            lastFailureAt:
                data.last_failure_at,

            lastLatencyMs:
                data.last_latency_ms,

            consecutiveFailures:
                data.consecutive_failures,

            rateLimitCount:
                data.rate_limit_count,

            timeoutCount:
                data.timeout_count,

            invalidJsonCount:
                data.invalid_json_count,

            providerErrorCount:
                data.provider_error_count,

            cooldownUntil:
                data.cooldown_until,

            updatedAt:
                data.updated_at,
        };
    } catch (error) {
        console.error(
            JSON.stringify({
                tag:
                    "AI_PROVIDER_HEALTH_GET_ERROR",
                provider,
                model,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            }),
        );

        return null;
    }
}

export async function updateAIHealthCheckRun(
    runId: string,
    update: Partial<
        Omit<AIHealthCheckRun, "runId">
    >,
): Promise<void> {
    try {
        const { error } =
            await supabaseAdmin
                .from("ai_health_check_runs")
                .update({
                    ...(update.source !== undefined && {
                        source: update.source,
                    }),

                    ...(update.status !== undefined && {
                        status: update.status,
                    }),

                    ...(update.startedAt !== undefined && {
                        started_at:
                            update.startedAt,
                    }),

                    ...(update.completedAt !== undefined && {
                        completed_at:
                            update.completedAt,
                    }),

                    ...(update.durationMs !== undefined && {
                        duration_ms:
                            update.durationMs,
                    }),

                    ...(update.providersTested !== undefined && {
                        providers_tested:
                            update.providersTested,
                    }),

                    ...(update.telemetryErrors !== undefined && {
                        telemetry_errors:
                            update.telemetryErrors,
                    }),

                    ...(update.providersPassed !== undefined && {
                        providers_passed:
                            update.providersPassed,
                    }),

                    ...(update.providersFailed !== undefined && {
                        providers_failed:
                            update.providersFailed,
                    }),
                })
                .eq("run_id", runId);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error(
            JSON.stringify({
                tag:
                    "AI_HEALTH_RUN_UPDATE_ERROR",
                runId,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            }),
        );
    }
}