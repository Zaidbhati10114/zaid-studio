// lib/ai-health/state.ts

import type {
    AIHealthEvent,
    AIProviderHealth,
    AIProviderHealthStatus,
} from "./types";

const DEGRADED_FAILURE_THRESHOLD = 1;
const UNAVAILABLE_FAILURE_THRESHOLD = 3;

export function calculateProviderHealth(
    current: AIProviderHealth | null,
    event: AIHealthEvent,
): AIProviderHealth {
    const now = event.createdAt;

    const consecutiveFailures =
        event.status === "success"
            ? 0
            : (current?.consecutiveFailures ?? 0) + 1;

    const rateLimitCount =
        (current?.rateLimitCount ?? 0) +
        (event.errorType === "rate_limit" ? 1 : 0);

    const timeoutCount =
        (current?.timeoutCount ?? 0) +
        (event.errorType === "timeout" ? 1 : 0);

    const invalidJsonCount =
        (current?.invalidJsonCount ?? 0) +
        (event.errorType === "invalid_json" ? 1 : 0);

    const providerErrorCount =
        (current?.providerErrorCount ?? 0) +
        (event.errorType === "provider_error"
            ? 1
            : 0);

    let status: AIProviderHealthStatus;

    if (consecutiveFailures >= UNAVAILABLE_FAILURE_THRESHOLD) {
        status = "unavailable";
    } else if (
        consecutiveFailures >=
        DEGRADED_FAILURE_THRESHOLD
    ) {
        status = "degraded";
    } else {
        status = "healthy";
    }

    return {
        provider: event.provider,
        model: event.model,
        status,

        lastSuccessAt:
            event.status === "success"
                ? now
                : current?.lastSuccessAt ?? null,

        lastFailureAt:
            event.status === "failed"
                ? now
                : current?.lastFailureAt ?? null,

        lastLatencyMs:
            event.latencyMs,

        consecutiveFailures,

        rateLimitCount,

        timeoutCount,

        invalidJsonCount,

        providerErrorCount,

        cooldownUntil:
            current?.cooldownUntil ?? null,

        updatedAt: now,
    };
}