import { MutationOptions, useMutation, useQuery } from "@tanstack/react-query";
import * as Sentry from "@sentry/nextjs";

import type { ProposalDraft } from "@/lib/ai/proposal-schema";
import type { SaveProposalDraftRequest } from "@/lib/types";
import { Quote } from "@/lib/models/quote";


export interface GenerateProposalRequest {
    quoteId: string;
    adminNotes?: string;
}

export interface SendProposalRequest {
    quoteId: string;
}

export interface SendProposalResponse {
    success: true;
}

export interface GenerateProposalResponse {
    success: true;
    proposal: ProposalDraft;
}

export interface SaveProposalResponse {
    success: true;
    draftId: string;
}

export class ProposalApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly details?: string
    ) {
        super(message);
        this.name = "ProposalApiError";
    }
}

async function sendProposal(
    body: SendProposalRequest
): Promise<SendProposalResponse> {

    const res = await fetch("/api/admin/proposals/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new ProposalApiError(
            res.status,
            data.error ?? "Failed to send proposal",
            data.details
        );
    }

    return data;
}


async function generateProposal(
    body: GenerateProposalRequest
): Promise<GenerateProposalResponse> {

    const res = await fetch("/api/admin/proposals/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new ProposalApiError(
            res.status,
            data.error ?? "Failed to generate proposal",
            data.details
        );
    }

    return data;
}


async function saveProposal(
    body: SaveProposalDraftRequest
): Promise<SaveProposalResponse> {

    const res = await fetch("/api/admin/proposals/save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new ProposalApiError(
            res.status,
            data.error ?? "Failed to save proposal",
            data.details
        );
    }

    return data;
}


export function useSendProposal(
    options?: {
        onSuccess?: (data: SendProposalResponse) => void;
        onError?: (error: ProposalApiError) => void;
    }
) {
    return useMutation<
        SendProposalResponse,
        ProposalApiError,
        SendProposalRequest
    >({
        mutationFn: sendProposal,

        onSuccess: options?.onSuccess,

        onError: (error: ProposalApiError) => {
            if (error.status >= 500) {
                Sentry.captureException(error, {
                    tags: {
                        layer: "proposal_send",
                    },
                });
            }

            options?.onError?.(error);
        },

        retry: (failureCount, error) => {
            if (
                error instanceof ProposalApiError &&
                error.status < 500
            ) {
                return false;
            }

            return failureCount < 2;
        },
    });
}



export function useGenerateProposal(
    options?: {
        onSuccess?: (data: GenerateProposalResponse) => void;
        onError?: (error: ProposalApiError) => void;
    }
) {

    return useMutation<
        GenerateProposalResponse,
        ProposalApiError,
        GenerateProposalRequest
    >({

        mutationFn: generateProposal,

        onSuccess: options?.onSuccess,

        onError: (error: ProposalApiError) => {

            if (error.status >= 500) {

                Sentry.captureException(error, {

                    tags: {
                        layer: "proposal_generate",
                    },

                    //   extra: variables,
                });

            }

            options?.onError?.(error);

        },

        retry: (failureCount, error) => {
            if (
                error instanceof ProposalApiError &&
                error.status < 500
            ) {
                return false;
            }

            return failureCount < 2;
        },
    });

}


export function useSaveProposal(
    options?: {
        onSuccess?: (data: SaveProposalResponse) => void;
        onError?: (error: ProposalApiError) => void;
    }
) {

    return useMutation<
        SaveProposalResponse,
        ProposalApiError,
        SaveProposalDraftRequest
    >({

        mutationFn: saveProposal,

        onSuccess: options?.onSuccess,

        onError: (error: ProposalApiError) => {

            if (error.status >= 500) {

                Sentry.captureException(error, {

                    tags: {
                        layer: "proposal_save",
                    },

                });
            }

            options?.onError?.(error);

        },

        retry: (failureCount, error) => {
            if (
                error instanceof ProposalApiError &&
                error.status < 500
            ) {
                return false;
            }

            return failureCount < 2;

        },



    });

}


export interface ProjectHubResponse {
    quote: Quote;
    proposalDraft: ProposalDraft | null;
}


async function fetchProjectHub(
    quoteId: string
): Promise<ProjectHubResponse> {

    const res =
        await fetch(
            `/api/admin/proposals/${quoteId}`
        );

    const data = await res.json();

    if (!res.ok) {

        throw new ProposalApiError(
            res.status,
            data.error,
            data.details
        );

    }

    return data;

}

export const proposalKeys = {
    all: ["proposals"] as const,

    projectHub: (quoteId: string) =>
        ["proposals", "project-hub", quoteId] as const,
};


export function useProjectHub(
    quoteId: string | null
) {

    return useQuery({
        queryKey: proposalKeys.projectHub(quoteId ?? ""),

        queryFn: () => fetchProjectHub(quoteId!),

        enabled: !!quoteId,

        staleTime: Infinity,

        gcTime: 1000 * 60 * 30,

        retry: (failureCount, error) => {
            if (
                error instanceof ProposalApiError &&
                error.status < 500
            ) {
                return false;
            }

            return failureCount < 2;
        },

        meta: {
            onError: (error: ProposalApiError) => {
                if (error.status >= 500) {
                    Sentry.captureException(error, {
                        tags: {
                            layer: "project_hub_fetch",
                        },
                        extra: {
                            quoteId,
                        },
                    });
                }
            },
        },
    });

}