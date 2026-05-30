// hooks/useQuote.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/nextjs";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface QuoteFormData {
    name: string;
    email: string;
    projectType: string;
    stage: string;
    budget: string;
    timeline: string;
    description: string;
}

export interface QuotePhase {
    name: string;
    duration: string;
}

export interface QuoteRisk {
    risk: string;
    mitigation: string;
}

export interface GeneratedQuote {
    complexity: "Simple" | "Medium" | "Complex";
    summary: string;
    estimatedTimeline: string;
    estimatedCost: string;
    whyHireMe: string;
    deliverables: string[];
    techStack: string[];
    phases: QuotePhase[];
    clientResponsibilities: string[];
    risks: QuoteRisk[];
    nextSteps: string[];
}

export interface GenerateQuoteResponse {
    success: true;
    quoteId: string;
    quote: GeneratedQuote;
}

export class QuoteApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly details?: string
    ) {
        super(message);
        this.name = "QuoteApiError";
    }
}

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const quoteKeys = {
    all: ["quotes"] as const,
    detail: (id: string) => ["quotes", id] as const,
};

// ─── API functions ───────────────────────────────────────────────────────────

async function generateQuote(form: QuoteFormData): Promise<GenerateQuoteResponse> {
    const res = await fetch("/api/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new QuoteApiError(
            res.status,
            data.error ?? "Failed to generate quote",
            data.details
        );
    }

    return data as GenerateQuoteResponse;
}

async function fetchQuote(id: string): Promise<GeneratedQuote & { id: string }> {
    const res = await fetch(`/api/quotes/${id}`);
    const data = await res.json();

    if (!res.ok) {
        throw new QuoteApiError(
            res.status,
            data.error ?? "Failed to fetch quote",
            data.details
        );
    }

    return data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useGenerateQuote(options?: {
    onSuccess?: (data: GenerateQuoteResponse) => void;
    onError?: (error: QuoteApiError) => void;  // ← just the type signature, nothing else
}) {
    const queryClient = useQueryClient();

    return useMutation<GenerateQuoteResponse, QuoteApiError, QuoteFormData>({
        mutationFn: generateQuote,

        onSuccess: (data) => {
            queryClient.setQueryData(quoteKeys.detail(data.quoteId), {
                id: data.quoteId,
                ...data.quote,
            });
            options?.onSuccess?.(data);
        },

        // ← Sentry capture lives here, inside the hook body
        onError: (error, variables) => {
            if (error.status !== 400) {
                Sentry.captureException(error, {
                    tags: { layer: "quote_mutation", status: String(error.status) },
                    extra: {
                        projectType: variables.projectType,
                        stage: variables.stage,
                        timeline: variables.timeline,
                        descriptionChars: variables.description.length,
                    },
                });
            }
            options?.onError?.(error);
        },

        retry: false,
    });
}

export function useQuote(id: string | null) {
    return useQuery({
        queryKey: quoteKeys.detail(id ?? ""),
        queryFn: () => fetchQuote(id!),
        enabled: !!id,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
        retry: (failureCount, error) => {
            if (error instanceof QuoteApiError && error.status < 500) return false;
            return failureCount < 2;
        },
        meta: {
            OnError: (error: QuoteApiError) => {
                if (error.status >= 500) {
                    Sentry.captureException(error, {
                        tags: { layer: "quote_fetch" },
                        extra: { quoteId: id },
                    })
                }
            }
        }
    });
}