// lib/ai-health/health-service.ts

import { supabaseAdmin } from "@/lib/supabase-server";

import type {
    AIHealthProvider,
    AIProviderHealth,
} from "./types";

/**
 * Get the current health state for a provider/model.
 */
export async function getProviderHealth(
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
                data.last_success_at ?? null,

            lastFailureAt:
                data.last_failure_at ?? null,

            lastLatencyMs:
                data.last_latency_ms ?? null,

            consecutiveFailures:
                data.consecutive_failures ?? 0,

            rateLimitCount:
                data.rate_limit_count ?? 0,

            timeoutCount:
                data.timeout_count ?? 0,

            invalidJsonCount:
                data.invalid_json_count ?? 0,

            providerErrorCount:
                data.provider_error_count ?? 0,

            cooldownUntil:
                data.cooldown_until ?? null,

            updatedAt:
                data.updated_at,
        };
    } catch (error) {
        console.error(
            JSON.stringify({
                tag:
                    "AI_HEALTH_SERVICE_ERROR",
                operation:
                    "getProviderHealth",
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

/**
 * Determine whether a provider can currently be used.
 *
 * Unknown provider health is treated as available so that
 * a missing health row does not accidentally disable AI generation.
 */
export async function isProviderAvailable(
    provider: AIHealthProvider,
    model: string,
): Promise<boolean> {
    const health =
        await getProviderHealth(
            provider,
            model,
        );

    if (!health) {
        return true;
    }

    // Explicitly unavailable providers are skipped.
    if (
        health.status ===
        "unavailable"
    ) {
        return false;
    }

    // A future cooldown means the provider should
    // temporarily not be used.
    if (
        health.cooldownUntil &&
        new Date(
            health.cooldownUntil,
        ).getTime() > Date.now()
    ) {
        return false;
    }

    return true;
}

export async function getAllProviderHealth(): Promise<
    AIProviderHealth[]
> {
    try {
        const { data, error } =
            await supabaseAdmin
                .from("ai_provider_health")
                .select("*")
                .order("provider");

        if (error) {
            throw error;
        }

        if (!data) {
            return [];
        }

        return data.map((row) => ({
            provider: row.provider,
            model: row.model,
            status: row.status,

            lastSuccessAt:
                row.last_success_at ?? null,

            lastFailureAt:
                row.last_failure_at ?? null,

            lastLatencyMs:
                row.last_latency_ms ?? null,

            consecutiveFailures:
                row.consecutive_failures ?? 0,

            rateLimitCount:
                row.rate_limit_count ?? 0,

            timeoutCount:
                row.timeout_count ?? 0,

            invalidJsonCount:
                row.invalid_json_count ?? 0,

            providerErrorCount:
                row.provider_error_count ?? 0,

            cooldownUntil:
                row.cooldown_until ?? null,

            updatedAt:
                row.updated_at,
        }));
    } catch (error) {
        console.error(
            JSON.stringify({
                tag:
                    "AI_HEALTH_SERVICE_ERROR",
                operation:
                    "getAllProviderHealth",
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            }),
        );

        return [];
    }
}