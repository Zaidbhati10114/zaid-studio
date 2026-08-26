import { MutationOptions, useMutation, useQuery } from "@tanstack/react-query";
import * as Sentry from "@sentry/nextjs";

import type { ProposalDraft } from "@/lib/ai/proposal-schema";
import type { SaveProposalDraftRequest } from "@/lib/types";
import { Quote } from "@/lib/models/quote";


export interface GenerateProposalRequest {
    quoteId: string;
    adminNotes?: string;
}

export interface ResendProposalVersionRequest {
    versionId: string;
}

export interface ResendProposalVersionResponse {
    success: true;
    versionNumber: number;
}

export interface ProposalVersionDetail extends ProposalDraft {
    id: string;
    versionNumber: number;
    status: "saved" | "sent" | "failed";
    baseVersionId: string | null;

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

async function resendProposalVersion(
    body: ResendProposalVersionRequest
): Promise<ResendProposalVersionResponse> {
    const res = await fetch("/api/admin/proposals/resend", {
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
            data.error ?? "Failed to resend proposal"
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

async function createRevision(
    body: CreateRevisionRequest
): Promise<CreateRevisionResponse> {

    const res = await fetch("/api/admin/proposals/revision", {
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
            data.error ?? "Failed to create revision",
            data.details
        );
    }

    return data;
}

export function useCreateRevision(
    options?: {
        onSuccess?: (data: CreateRevisionResponse) => void;
        onError?: (error: ProposalApiError) => void;
    }
) {
    return useMutation<
        CreateRevisionResponse,
        ProposalApiError,
        CreateRevisionRequest
    >({
        mutationFn: createRevision,

        onSuccess: options?.onSuccess,

        onError: (error) => {
            if (error.status >= 500) {
                Sentry.captureException(error, {
                    tags: {
                        layer: "proposal_revision",
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

async function fetchProposalVersion(
    versionId: string
): Promise<ProposalVersionDetail> {

    const res = await fetch(
        `/api/admin/proposals/version/${versionId}`
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

export function useResendProposalVersion(
    options?: {
        onSuccess?: (data: ResendProposalVersionResponse) => void;
        onError?: (error: ProposalApiError) => void;
    }
) {
    return useMutation<
        ResendProposalVersionResponse,
        ProposalApiError,
        ResendProposalVersionRequest
    >({
        mutationFn: resendProposalVersion,

        onSuccess: options?.onSuccess,

        onError: (error) => {
            if (error.status >= 500) {
                Sentry.captureException(error, {
                    tags: {
                        layer: "proposal_resend",
                    },
                });
            }

            options?.onError?.(error);
        },

        retry: (failureCount, error) => {
            if (error instanceof ProposalApiError && error.status < 500) {
                return false;
            }

            return failureCount < 2;
        },
    });
}


export interface ProposalVersion {
    id: string;
    versionNumber: number;
    status: "saved" | "sent" | "failed";
    baseVersionId: string | null;
    createdAt: string;
    sentAt: string | null;
}

export interface CreateRevisionRequest {
    quoteId: string;
}

export interface CreateRevisionResponse {
    success: true;
    version: {
        id: string;
        versionNumber: number;
        status: "saved";
    };
}

export interface ProjectHubResponse {
    quote: Quote;
    proposalDraft: ProposalDraft | null;
    versions: ProposalVersion[];
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

    version: (versionId: string) =>
        ["proposals", "version", versionId] as const,
};

export function useProposalVersion(
    versionId: string | null
) {
    return useQuery({
        queryKey: proposalKeys.version(versionId ?? ""),
        queryFn: () => fetchProposalVersion(versionId!),
        enabled: !!versionId,
        staleTime: Infinity,
        placeholderData: (previousData) => previousData,
    });
}


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