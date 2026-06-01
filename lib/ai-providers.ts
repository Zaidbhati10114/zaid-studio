import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { SarvamAIClient } from "sarvamai";

import type { GeneratedQuote } from "@/hooks/useQuote";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProviderName = "gemini" | "groq" | "sarvam";

interface AIProvider {
    name: ProviderName;
    call: (prompt: string) => Promise<string>;
}

// ─── Clients ──────────────────────────────────────────────────────────────────

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const sarvam = new SarvamAIClient({ apiSubscriptionKey: process.env.SARVAM_API_KEY! });

// ─── Providers — fastest first ────────────────────────────────────────────────

const providers: AIProvider[] = [
    {
        name: "groq",
        call: async (prompt) => {
            const result = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 2500,
                response_format: { type: "json_object" },
            });
            return result.choices[0]?.message?.content ?? "";
        },
    },
    {
        name: "gemini",
        call: async (prompt) => {
            const model = gemini.getGenerativeModel({
                model: "gemini-3-flash-preview",
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.7,
                    maxOutputTokens: 2500,
                },
            });
            const result = await model.generateContent(prompt);
            return result.response.text();
        },
    },
    {
        name: "sarvam",
        call: async (prompt) => {
            const result = await sarvam.chat.completions({
                model: "sarvam-105b",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 2500,
            });
            return result.choices[0]?.message?.content ?? "";
        },
    },
];

// ─── Round-robin counter ──────────────────────────────────────────────────────

let currentIndex = 0;

function isRateLimitError(err: unknown): boolean {
    const status = (err as any)?.status;
    return status === 429 || status === 503;
}

function parseJSON(text: string, providerName: ProviderName): GeneratedQuote {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`${providerName}: No JSON found in response`);
    return JSON.parse(match[0]) as GeneratedQuote;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function callAIWithFallback(prompt: string): Promise<GeneratedQuote> {
    const startIndex = currentIndex % providers.length;
    let lastErr: unknown;

    for (let i = 0; i < providers.length; i++) {
        const provider = providers[(startIndex + i) % providers.length];
        const t0 = Date.now();

        try {
            console.log(JSON.stringify({ tag: "QG", stage: "ai_attempt", provider: provider.name }));

            const text = await provider.call(prompt);
            const parsed = parseJSON(text, provider.name);

            console.log(JSON.stringify({
                tag: "QG",
                stage: "ai_ok",
                provider: provider.name,
                ms: Date.now() - t0,
                complexity: parsed.complexity,
            }));

            // Advance round-robin so next request starts on the next provider
            currentIndex = (startIndex + i + 1) % providers.length;

            return parsed;

        } catch (err) {
            lastErr = err;
            const isRateLimit = isRateLimitError(err);

            console.error(JSON.stringify({
                tag: "QG_ERR",
                stage: "ai_provider_fail",
                provider: provider.name,
                ms: Date.now() - t0,
                status: (err as any)?.status,
                message: err instanceof Error ? err.message.slice(0, 150) : String(err),
                willTryNext: isRateLimit && i < providers.length - 1,
            }));

            // Only fall through to next provider on rate limit errors
            // Parse errors or auth errors should not try the next provider
            if (!isRateLimit) break;
        }
    }

    // All providers failed — capture to Sentry and throw
    console.error(JSON.stringify({
        tag: "QG_ERR",
        stage: "all_providers_failed",
        message: lastErr instanceof Error ? lastErr.message : String(lastErr),
    }));

    throw lastErr;
}