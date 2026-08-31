// lib/ai-health/types.ts

export type AIHealthStatus =
    | "success"
    | "failed";

export type AIProviderHealthStatus =
    | "healthy"
    | "degraded"
    | "unavailable";

export type AIHealthCheckSource =
    | "scheduled_health_check"
    | "manual_health_check";

export type AIHealthEventSource =
    | "user_request"
    | "scheduled_health_check"
    | "manual_health_check";

export type AIHealthCheckRunStatus =
    | "running"
    | "completed"
    | "failed";


export interface AIHealthCheckRun {
    runId: string;

    source: AIHealthCheckSource;

    status: AIHealthCheckRunStatus;

    startedAt: string;

    completedAt: string | null;

    durationMs: number | null;

    providersTested: number;

    providersPassed: number;

    providersFailed: number;
    telemetryErrors: number;
}

export interface AIProviderHealth {
    provider: AIHealthProvider;

    model: string;

    status: AIProviderHealthStatus;

    lastSuccessAt: string | null;

    lastFailureAt: string | null;

    lastLatencyMs: number | null;

    consecutiveFailures: number;

    rateLimitCount: number;

    timeoutCount: number;

    invalidJsonCount: number;

    providerErrorCount: number;

    cooldownUntil: string | null;

    updatedAt: string;
}

export type AIHealthErrorType =
    | "timeout"
    | "rate_limit"
    | "provider_unavailable"
    | "invalid_json"
    | "empty_response"
    | "provider_error"
    | "authentication_error"
    | "invalid_request";

export type AIHealthProvider =
    | "groq"
    | "gemini"
    | "sarvam";

export interface AIHealthEvent {
    provider: AIHealthProvider;

    model: string;

    status: AIHealthStatus;

    latencyMs: number;

    errorType: AIHealthErrorType | null;

    httpStatus: number | null;

    requestId: string | null;

    source: AIHealthEventSource;

    runId: string | null;
    requestCorrelationId: string | null;
    isFallback: boolean;

    createdAt: string;
}