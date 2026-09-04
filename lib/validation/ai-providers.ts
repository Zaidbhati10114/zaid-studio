import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { SarvamAIClient } from "sarvamai";
import { trackAIHealth } from "@/lib/ai-health/tracker";
import { getActiveModel } from "@/lib/ai/model-registry";
// ─── Types ────────────────────────────────────────────────────────────────────

type ProviderName = "groq" | "gemini" | "sarvam";

type Task =
    | "quote_generation"
    | "proposal_generation"
    | "fallback_generation"
    | "fallback_generation_secondary"
    | "standalone_test";

type AIErrorType =
    | "timeout"
    | "rate_limit"
    | "provider_unavailable"
    | "invalid_json"
    | "empty_response"
    | "provider_error"
    | "authentication_error"
    | "invalid_request";

interface AIProvider {
    name: ProviderName;
    priority: number;
    call: (
        prompt: string,
        modelOverride?: string,
        task?: Task
    ) => Promise<string>;
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export class AIProviderError extends Error {
    constructor(
        message: string,
        public readonly provider: ProviderName,
        public readonly type: AIErrorType,
        public readonly status?: number,
        public readonly retryable: boolean = false,
    ) {
        super(message);
        this.name = "AIProviderError";
    }
}

// ─── Configuration ────────────────────────────────────────────────────────────

// Maximum time allowed for a single provider attempt.
const PROVIDER_TIMEOUT_MS = 20_000;

// Maximum time allowed for the entire AI generation,
// including all fallback attempts.
const TOTAL_GENERATION_TIMEOUT_MS = 30_000;

// Provider remains temporarily unavailable after a
// rate-limit or provider-unavailable response.
const PROVIDER_COOLDOWN_MS = 60_000;

// ─── Clients ──────────────────────────────────────────────────────────────────

const gemini = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY!,
);

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

const sarvam = new SarvamAIClient({
    apiSubscriptionKey: process.env.SARVAM_API_KEY!,
});

// ─── Provider Cooldown State ──────────────────────────────────────────────────

const providerCooldownUntil: Record<
    ProviderName,
    number
> = {
    groq: 0,
    gemini: 0,
    sarvam: 0,
};

function isProviderCoolingDown(
    provider: ProviderName,
): boolean {
    return (
        providerCooldownUntil[provider] >
        Date.now()
    );
}

function setProviderCooldown(
    provider: ProviderName,
    cooldownMs = PROVIDER_COOLDOWN_MS,
    source = "fallback",
): void {
    const cooldownUntil =
        Date.now() + cooldownMs;

    providerCooldownUntil[provider] =
        cooldownUntil;

    console.warn(
        JSON.stringify({
            tag: "AI_PROVIDER_COOLDOWN",
            provider,
            cooldownMs,
            source,
            cooldownUntil:
                new Date(
                    cooldownUntil,
                ).toISOString(),
        }),
    );
}

// ─── Error Helpers ────────────────────────────────────────────────────────────

function getErrorStatus(
    error: unknown,
): number | undefined {
    const status =
        (error as { status?: unknown })?.status;

    return typeof status === "number"
        ? status
        : undefined;
}

function getRetryAfterMs(error: unknown): number | undefined {
    const headers =
        (error as {
            headers?: Headers;
        })?.headers;

    if (!headers) {
        return undefined;
    }

    const retryAfter =
        headers.get("retry-after");

    if (retryAfter) {
        const seconds = Number(
            retryAfter,
        );

        if (
            Number.isFinite(seconds) &&
            seconds > 0
        ) {
            return Math.ceil(
                seconds * 1000,
            );
        }
    }

    const resetTokens =
        headers.get(
            "x-ratelimit-reset-tokens",
        );

    if (resetTokens) {
        const match =
            resetTokens.match(
                /([\d.]+)s/i,
            );

        if (match) {
            const seconds =
                Number(match[1]);

            if (
                Number.isFinite(seconds) &&
                seconds > 0
            ) {
                return Math.ceil(
                    seconds * 1000,
                );
            }
        }
    }

    return undefined;
}

function classifyProviderError(
    error: unknown,
    provider: ProviderName,
): AIProviderError {
    if (error instanceof AIProviderError) {
        return error;
    }

    const status =
        getErrorStatus(error);

    const message =
        error instanceof Error
            ? error.message
            : String(error);

    // Authentication/configuration errors:
    // fallback will not fix these.
    if (
        status === 401 ||
        status === 403
    ) {
        return new AIProviderError(
            message,
            provider,
            "authentication_error",
            status,
            false,
        );
    }

    // Invalid request errors:
    // fallback will not fix malformed requests.
    if (
        status === 400 ||
        status === 413
    ) {
        return new AIProviderError(
            message,
            provider,
            "invalid_request",
            status,
            false,
        );
    }

    // Rate limiting is recoverable through fallback.
    if (status === 429) {
        return new AIProviderError(
            message,
            provider,
            "rate_limit",
            status,
            true,
        );
    }

    // Temporary provider failures are recoverable.
    if (
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504
    ) {
        return new AIProviderError(
            message,
            provider,
            "provider_unavailable",
            status,
            true,
        );
    }

    return new AIProviderError(
        message,
        provider,
        "provider_error",
        status,
        false,
    );
}

// ─── Health Check Provider Access ─────────────────────────────────────────────

export async function testAIProvider(
    providerName: ProviderName,
    prompt: string,
    modelOverride?: string,
): Promise<{
    model: string;
    text: string;
}> {
    const provider = providers.find(
        (item) => item.name === providerName,
    );

    if (!provider) {
        throw new Error(
            `Unknown AI provider: ${providerName}`,
        );
    }

    const text = await withTimeout(
        provider.call(prompt, modelOverride),
        provider.name,
        PROVIDER_TIMEOUT_MS,
    );

    return {
        model:
            modelOverride ??
            (await getActiveModel(
                provider.name === "groq"
                    ? "quote_generation"
                    : provider.name === "gemini"
                        ? "fallback_generation"
                        : "fallback_generation_secondary",
            )),
        text,
    };
}

// ─── Timeout Helper ───────────────────────────────────────────────────────────

async function withTimeout<T>(
    promise: Promise<T>,
    provider: ProviderName,
    timeoutMs: number,
): Promise<T> {
    let timeoutId:
        | ReturnType<typeof setTimeout>
        | undefined;

    const timeoutPromise =
        new Promise<never>(
            (_, reject) => {
                timeoutId =
                    setTimeout(() => {
                        reject(
                            new AIProviderError(
                                `${provider}: Request timed out after ${timeoutMs}ms`,
                                provider,
                                "timeout",
                                undefined,
                                true,
                            ),
                        );
                    }, timeoutMs);
            },
        );

    try {
        return await Promise.race([
            promise,
            timeoutPromise,
        ]);
    } finally {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
}

// ─── Providers ────────────────────────────────────────────────────────────────

const providers: AIProvider[] = [
    {
        name: "groq",
        priority: 1,



        call: async (prompt, modelOverride, task) => {

            try {
                const activeModel =
                    modelOverride ??
                    (await getActiveModel(
                        task ?? "quote_generation",
                    ));
                const result =
                    await groq.chat.completions.create({
                        model: activeModel,

                        messages: [
                            {
                                role: "user",
                                content: prompt,
                            },
                        ],

                        temperature: 0.7,

                        max_completion_tokens:
                            2500,

                        reasoning_effort: 'low',

                        response_format: {
                            type: "json_object",
                        },
                    });

                console.log(
                    JSON.stringify({
                        tag: "AI_PROVIDER_USAGE",
                        provider: "groq",
                        usage: result.usage ?? null,
                    }),
                );

                return (
                    result.choices[0]
                        ?.message
                        ?.content ?? ""
                );
            } catch (error) {
                throw classifyProviderError(
                    error,
                    "groq",
                );
            }
        },
    },

    {
        name: "gemini",
        priority: 2,

        call: async (prompt, modelOverride, task) => {
            try {
                const activeModel =
                    modelOverride ??
                    (await getActiveModel(task ?? "fallback_generation"));
                const model =
                    gemini.getGenerativeModel({
                        model: activeModel,

                        generationConfig: {
                            responseMimeType:
                                "application/json",

                            temperature:
                                0.7,

                            maxOutputTokens:
                                4096,
                        },
                    });

                const result =
                    await model.generateContent(
                        prompt,
                    );

                return result.response.text();
            } catch (error) {
                throw classifyProviderError(
                    error,
                    "gemini",
                );
            }
        },
    },

    {
        name: "sarvam",
        priority: 3,

        call: async (prompt, modelOverride, task) => {
            try {
                const activeModel =
                    modelOverride ??
                    (await getActiveModel(
                        task ?? "fallback_generation_secondary",
                    ));
                const result =
                    await sarvam.chat.completions({
                        model: activeModel as any,

                        messages: [
                            {
                                role: "user",
                                content: prompt,
                            },
                        ],

                        temperature: 0.7,

                        max_tokens: 6000,
                    });

                return (
                    result.choices[0]
                        ?.message
                        ?.content ?? ""
                );
            } catch (error) {
                throw classifyProviderError(
                    error,
                    "sarvam",
                );
            }
        },
    },
];

// Providers are now explicitly priority ordered.
// Lower priority number = preferred provider.
const orderedProviders = [
    ...providers,
].sort(
    (a, b) =>
        a.priority - b.priority,
);

// ─── JSON Parsing ─────────────────────────────────────────────────────────────

function parseJSON<T>(
    text: string,
    providerName: ProviderName,
): T {

    const cleaned = text
        .replace(/```json|```/g, "")
        .trim();

    if (!cleaned) {
        throw new AIProviderError(
            `${providerName}: Empty response`,
            providerName,
            "empty_response",
            undefined,
            true,
        );
    }

    const match =
        cleaned.match(/\{[\s\S]*\}/);

    if (!match) {
        throw new AIProviderError(
            `${providerName}: No JSON found`,
            providerName,
            "invalid_json",
            undefined,
            true,
        );
    }

    try {
        return JSON.parse(
            match[0],
        ) as T;
    } catch (error) {
        throw new AIProviderError(
            `${providerName}: Invalid JSON: ${error instanceof Error
                ? error.message
                : String(error)
            }`,
            providerName,
            "invalid_json",
            undefined,
            true,
        );
    }
}




// ─── Main Export ──────────────────────────────────────────────────────────────

export async function callAIWithFallback<T>(
    prompt: string,
    options?: {
        provider?: ProviderName;
        bypassCooldown?: boolean;
        task?: Task;
    },
): Promise<T> {

    const generationStartedAt = Date.now();
    const requestCorrelationId =
        crypto.randomUUID();

    const resolvedTask: Task =
        options?.task ?? "quote_generation";

    const availableProviders = options?.provider
        ? providers.filter(
            (provider) =>
                provider.name === options.provider,
        )
        : orderedProviders;

    let lastError:
        | AIProviderError
        | undefined;

    let fallbackUsed = false;

    for (
        let i = 0;
        i < availableProviders.length;
        i++
    ) {
        const provider =
            availableProviders[i];

        const isFallback = fallbackUsed;

        // Skip providers that are currently in cooldown.
        // Benchmark mode can bypass cooldown.
        if (
            !options?.bypassCooldown &&
            isProviderCoolingDown(provider.name)
        ) {
            console.warn(
                JSON.stringify({
                    tag: "AI_PROVIDER_SKIP",
                    provider: provider.name,
                    reason: "cooldown",
                }),
            );

            continue;
        }

        // Calculate remaining total generation budget.
        const elapsed =
            Date.now() -
            generationStartedAt;

        const remainingTime =
            TOTAL_GENERATION_TIMEOUT_MS -
            elapsed;

        if (remainingTime <= 0) {
            lastError =
                new AIProviderError(
                    `AI generation exceeded total timeout of ${TOTAL_GENERATION_TIMEOUT_MS}ms`,
                    provider.name,
                    "timeout",
                    undefined,
                    false,
                );

            break;
        }

        // One provider cannot exceed either:
        // - provider timeout
        // - remaining total generation time
        const attemptTimeout =
            Math.min(
                PROVIDER_TIMEOUT_MS,
                remainingTime,
            );

        const attemptStartedAt =
            Date.now();

        try {
            console.log(
                JSON.stringify({
                    tag: "AI_PROVIDER_ATTEMPT",
                    requestCorrelationId,
                    provider: provider.name,
                    priority: provider.priority,
                    attempt: i + 1,
                    isFallback,
                    remainingMs: remainingTime,
                }),
            );

            const text =
                await withTimeout(
                    provider.call(prompt, undefined, resolvedTask),
                    provider.name,
                    attemptTimeout,
                );

            const providerLatencyMs =
                Date.now() -
                attemptStartedAt;

            console.log(
                JSON.stringify({
                    tag: "AI_PROVIDER",
                    stage: "response",
                    provider: provider.name,
                    latencyMs: providerLatencyMs,
                    responseChars: text.length,
                }),
            );

            // Parse/validate JSON.
            const parsed =
                parseJSON<T>(
                    text,
                    provider.name,
                );

            // ─── Health: Success ─────────────────────────────

            await trackAIHealth({
                provider: provider.name,
                model: await getActiveModel(
                    provider.name === "groq"
                        ? "quote_generation"
                        : provider.name === "gemini"
                            ? "fallback_generation"
                            : "fallback_generation_secondary",
                ),
                status: "success",
                latencyMs: providerLatencyMs,
                errorType: null,
                httpStatus: null,
                requestId: null,
                source: "user_request",
                runId: null,

                requestCorrelationId,
                isFallback,

                createdAt:
                    new Date().toISOString(),
            });

            console.log(
                JSON.stringify({
                    tag: "AI_PROVIDER",
                    stage: "success",
                    provider: provider.name,
                    latencyMs: providerLatencyMs,
                    totalGenerationMs:
                        Date.now() -
                        generationStartedAt,
                }),
            );

            return parsed;
        } catch (error) {
            const aiError =
                classifyProviderError(
                    error,
                    provider.name,
                );

            lastError = aiError;

            const attemptLatencyMs =
                Date.now() -
                attemptStartedAt;

            const totalGenerationMs =
                Date.now() -
                generationStartedAt;
            console.error(
                JSON.stringify({
                    tag: "AI_PROVIDER_ERROR",
                    requestCorrelationId,
                    provider: provider.name,
                    priority: provider.priority,
                    type: aiError.type,
                    status: aiError.status ?? null,
                    retryable: aiError.retryable,
                    latencyMs: attemptLatencyMs,
                    totalGenerationMs,
                    isFallback,
                    error: aiError.message,
                }),
            );

            // ─── Health: Failure ─────────────────────────────

            await trackAIHealth({
                provider: provider.name,
                model: await getActiveModel(
                    provider.name === "groq"
                        ? "quote_generation"
                        : provider.name === "gemini"
                            ? "fallback_generation"
                            : "fallback_generation_secondary",
                ),
                status: "failed",
                latencyMs: attemptLatencyMs,
                errorType: aiError.type,
                httpStatus:
                    aiError.status ?? null,
                requestId: null,
                source: "user_request",
                runId: null,

                requestCorrelationId,
                isFallback,

                createdAt:
                    new Date().toISOString(),
            });

            // Rate limits and temporary provider
            // failures trigger cooldown in production.
            if (
                !options?.bypassCooldown &&
                (
                    aiError.type ===
                    "rate_limit" ||
                    aiError.type ===
                    "provider_unavailable"
                )
            ) {
                const retryAfterMs =
                    getRetryAfterMs(error);

                setProviderCooldown(
                    provider.name,
                    retryAfterMs ??
                    PROVIDER_COOLDOWN_MS,
                    retryAfterMs
                        ? "retry-after"
                        : "fallback",
                );
            }

            // Do not fallback on non-recoverable errors.
            if (!aiError.retryable) {
                break;
            }

            fallbackUsed = true;

            const remainingAfterFailure =
                TOTAL_GENERATION_TIMEOUT_MS -
                (Date.now() -
                    generationStartedAt);

            if (
                remainingAfterFailure <= 0
            ) {
                break;
            }

            const nextAvailable =
                availableProviders
                    .slice(i + 1)
                    .find(
                        (candidate) =>
                            options?.bypassCooldown ||
                            !isProviderCoolingDown(
                                candidate.name,
                            ),
                    );

            console.warn(
                JSON.stringify({
                    tag:
                        "AI_PROVIDER_FALLBACK",
                    failedProvider:
                        provider.name,
                    reason:
                        aiError.type,
                    nextProvider:
                        nextAvailable?.name ??
                        null,
                    remainingMs:
                        remainingAfterFailure,
                }),
            );
        }
    }

    const totalGenerationMs =
        Date.now() -
        generationStartedAt;

    console.error(
        JSON.stringify({
            tag: "QG_ERR",
            stage:
                "all_providers_failed",
            type:
                lastError?.type ??
                "provider_error",
            provider:
                lastError?.provider ??
                null,
            status:
                lastError?.status ??
                null,
            totalGenerationMs,
            message:
                lastError?.message ??
                "All AI providers failed",
        }),
    );

    throw (
        lastError ??
        new Error(
            "All AI providers failed",
        )
    );
}