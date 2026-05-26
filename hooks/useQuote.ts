// hooks/useQuote.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

// Typed API error — carries HTTP status + server message
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

/**
 * Mutation hook for generating a new quote.
 *
 * Usage:
 *   const { mutate, isPending, isError, error, data } = useGenerateQuote({
 *     onSuccess: (data) => router.push(`/quotes/${data.quoteId}`),
 *   });
 */
export function useGenerateQuote(options?: {
    onSuccess?: (data: GenerateQuoteResponse) => void;
    onError?: (error: QuoteApiError) => void;
}) {
    const queryClient = useQueryClient();

    return useMutation<GenerateQuoteResponse, QuoteApiError, QuoteFormData>({
        mutationFn: generateQuote,

        onSuccess: (data) => {
            // Pre-populate the quote detail cache so /quotes/[id] loads instantly
            queryClient.setQueryData(quoteKeys.detail(data.quoteId), {
                id: data.quoteId,
                ...data.quote,
            });
            options?.onSuccess?.(data);
        },

        onError: (error) => {
            options?.onError?.(error);
        },

        // No automatic retry for user-facing form submissions — a failed
        // generation shouldn't silently duplicate DB rows.
        retry: false,
    });
}

/**
 * Query hook for fetching a saved quote by ID.
 *
 * Usage:
 *   const { data, isLoading, isError } = useQuote(quoteId);
 */
export function useQuote(id: string | null) {
    return useQuery({
        queryKey: quoteKeys.detail(id ?? ""),
        queryFn: () => fetchQuote(id!),
        enabled: !!id,
        staleTime: Infinity, // Quotes are immutable once generated
        gcTime: 1000 * 60 * 30, // Keep in cache 30 min
        retry: (failureCount, error) => {
            // Don't retry 4xx client errors
            if (error instanceof QuoteApiError && error.status < 500) return false;
            return failureCount < 2;
        },
    });
}