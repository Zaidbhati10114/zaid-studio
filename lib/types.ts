import { ProposalPhase, ProposalRisk } from "@/lib/ai/proposal-schema";

export interface QuoteRequestBody {
    name: string;
    email: string;
    projectType: string;
    stage: string;
    budget?: string;
    timeline: string;
    description: string;
}


export interface ProposalGenerationInput {
    quoteId: string;
    clientName: string;

    projectType: string;
    description: string;

    summary: string;
    estimatedTimeline: string;
    estimatedCost: string;
    complexity: string;

    deliverables: string[];
    techStack: string[];

    phases: ProposalPhase[];

    clientResponsibilities: string[];

    risks: ProposalRisk[];

    nextSteps: string[];

    adminNotes?: string;
    meetingNotes?: string
}

import type { ProposalDraft } from "@/lib/ai/proposal-schema";

export interface SaveProposalDraftRequest {
    quoteId: string;
    proposal: ProposalDraft;
}