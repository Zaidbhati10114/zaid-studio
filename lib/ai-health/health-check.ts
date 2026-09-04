// lib/ai-health/health-check.ts



import { AIProviderError, testAIProvider } from "../validation/ai-providers";
import {
    createAIHealthCheckRun,
    updateAIHealthCheckRun,
} from "./repository";

import { trackAIHealth } from "./tracker";

import type {
    AIHealthEvent,
    AIHealthProvider,
    AIHealthCheckSource,
} from "./types";

const HEALTH_CHECK_PROMPT = `
Return ONLY valid JSON.

Return exactly:

{
  "healthCheck": true
}
`;

const PROVIDERS: AIHealthProvider[] = [
    "groq",
    "gemini",
    "sarvam",
];

const MODELS: Record<
    AIHealthProvider,
    string
> = {
    groq: "openai/gpt-oss-20b",
    gemini: "gemini-2.5-flash",
    sarvam: "sarvam-105b",
};

export type ProviderHealthCheckResult = {
    provider: AIHealthProvider;
    model: string;
    success: boolean;
    latencyMs: number;
    errorType: AIHealthEvent["errorType"];
    httpStatus: number | null;
    error: string | null;
    eventSaved: boolean;
};

/**
 * Validate the minimal health-check response.
 */
function validateHealthCheckResponse(
    text: string,
    provider: AIHealthProvider,
): void {
    const cleaned = text
        .replace(/```json|```/g, "")
        .trim();

    if (!cleaned) {
        throw new AIProviderError(
            "Health check returned an empty response",
            provider,
            "empty_response",
            undefined,
            true,
        );
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new AIProviderError(
            "Health check returned invalid JSON",
            provider,
            "invalid_json",
            undefined,
            true,
        );
    }

    if (
        typeof parsed !== "object" ||
        parsed === null ||
        !("healthCheck" in parsed) ||
        (parsed as {
            healthCheck?: unknown;
        }).healthCheck !== true
    ) {
        throw new AIProviderError(
            "Health check returned unexpected JSON",
            provider,
            "invalid_json",
            undefined,
            true,
        );
    }
}

/**
 * Test one provider.
 *
 * One provider failing does not stop the health check.
 */
async function checkProvider(
    provider: AIHealthProvider,
    runId: string,
    source: AIHealthCheckSource,
): Promise<ProviderHealthCheckResult> {
    const model = MODELS[provider];
    const startedAt = Date.now();

    try {
        const result =
            await testAIProvider(
                provider,
                HEALTH_CHECK_PROMPT,
            );

        const latencyMs =
            Date.now() - startedAt;

        validateHealthCheckResponse(
            result.text,
            provider,
        );

        const healthTracking =
            await trackAIHealth({
                provider,
                model,
                status: "success",
                latencyMs,
                errorType: null,
                httpStatus: null,
                requestId: null,
                source,
                runId,
                requestCorrelationId: null,
                isFallback: false,
                createdAt:
                    new Date().toISOString(),
            });

        return {
            provider,
            model,
            success: true,
            latencyMs,
            errorType: null,
            httpStatus: null,
            error: null,
            eventSaved:
                healthTracking.eventSaved,
        };
    } catch (error) {
        const latencyMs =
            Date.now() - startedAt;

        const aiError =
            error instanceof AIProviderError
                ? error
                : new AIProviderError(
                    error instanceof Error
                        ? error.message
                        : String(error),
                    provider,
                    "provider_error",
                    undefined,
                    false,
                );

        const healthTracking =
            await trackAIHealth({
                provider,
                model,
                status: "failed",
                latencyMs,
                errorType: aiError.type,
                httpStatus:
                    aiError.status ?? null,
                requestId: null,
                source,
                runId,
                requestCorrelationId: null,
                isFallback: false,
                createdAt:
                    new Date().toISOString(),
            });

        return {
            provider,
            model,
            success: false,
            latencyMs,
            errorType: aiError.type,
            httpStatus:
                aiError.status ?? null,
            error: aiError.message,
            eventSaved:
                healthTracking.eventSaved,
        };
    }
}

/**
 * Run a complete health check.
 *
 * This is the SINGLE health-check entry point used by:
 *
 * - scheduled health checks
 * - manual admin checks
 *
 * The source tells us why the run was started.
 */
export async function runProviderHealthCheck(
    source: AIHealthCheckSource,
): Promise<{
    runId: string;
    source: AIHealthCheckSource;
    status: "completed";
    durationMs: number;
    results: ProviderHealthCheckResult[];
}> {
    const runId = crypto.randomUUID();
    const startedAt = new Date();

    // Create run record immediately.
    await createAIHealthCheckRun({
        runId,
        source,
        status: "running",
        startedAt:
            startedAt.toISOString(),
        completedAt: null,
        durationMs: null,
        providersTested: 0,
        providersPassed: 0,
        providersFailed: 0,
        telemetryErrors: 0,
    });

    const results: ProviderHealthCheckResult[] = [];

    try {
        // Keep provider checks sequential.
        for (const provider of PROVIDERS) {
            const result =
                await checkProvider(
                    provider,
                    runId,
                    source,
                );

            results.push(result);
        }

        const providersTested =
            results.length;

        const providersPassed =
            results.filter(
                (result) =>
                    result.success,
            ).length;

        const providersFailed =
            providersTested -
            providersPassed;

        const telemetryErrors =
            results.filter(
                (result) =>
                    !result.eventSaved,
            ).length;

        const completedAt =
            new Date();

        const durationMs =
            completedAt.getTime() -
            startedAt.getTime();

        await updateAIHealthCheckRun(
            runId,
            {
                status: "completed",
                completedAt:
                    completedAt.toISOString(),
                durationMs,
                providersTested,
                providersPassed,
                providersFailed,
                telemetryErrors,
            },
        );

        console.log(
            JSON.stringify({
                tag:
                    "AI_HEALTH_CHECK_COMPLETE",
                runId,
                source,
                status: "completed",
                durationMs,
                providersTested,
                providersPassed,
                providersFailed,
            }),
        );

        return {
            runId,
            source,
            status: "completed",
            durationMs,
            results,
        };
    } catch (error) {
        // This is a failure of the health-check runner itself,
        // not an individual provider failure.
        const completedAt =
            new Date();

        const durationMs =
            completedAt.getTime() -
            startedAt.getTime();

        await updateAIHealthCheckRun(
            runId,
            {
                status: "failed",
                completedAt:
                    completedAt.toISOString(),
                durationMs,
                providersTested:
                    results.length,
                providersPassed:
                    results.filter(
                        (result) =>
                            result.success,
                    ).length,
                providersFailed:
                    results.filter(
                        (result) =>
                            !result.success,
                    ).length,
                telemetryErrors:
                    results.filter(
                        (result) =>
                            !result.eventSaved,
                    ).length,
            },
        );

        console.error(
            JSON.stringify({
                tag:
                    "AI_HEALTH_CHECK_RUN_FAILED",
                runId,
                source,
                durationMs,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            }),
        );

        throw error;
    }
}