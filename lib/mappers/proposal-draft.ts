// lib/mappers/proposal-draft.ts

import type { ProposalDraft } from "@/lib/ai/proposal-schema";

export function dbToProposalDraft(row: any): ProposalDraft {
    return {
        summary: row.summary,

        estimatedTimeline: row.estimated_timeline,

        estimatedCost: row.estimated_cost,

        complexity: row.complexity,

        deliverables: row.deliverables ?? [],

        techStack: row.tech_stack ?? [],

        phases: row.phases ?? [],

        clientResponsibilities: row.client_responsibilities ?? [],

        risks: row.risks ?? [],

        nextSteps: row.next_steps ?? [],

        supportPolicy: row.agency_support_policy ?? "",

        paymentTerms: row.agency_payment_terms ?? "",

        ownershipTerms: row.agency_ownership_terms ?? "",
    };
}

export function proposalDraftToDb(proposal: ProposalDraft) {
    return {
        summary: proposal.summary,

        estimated_timeline: proposal.estimatedTimeline,

        estimated_cost: proposal.estimatedCost,

        complexity: proposal.complexity,

        deliverables: proposal.deliverables,

        tech_stack: proposal.techStack,

        phases: proposal.phases,

        client_responsibilities: proposal.clientResponsibilities,

        risks: proposal.risks,

        next_steps: proposal.nextSteps,

        agency_support_policy: proposal.supportPolicy,

        agency_payment_terms: proposal.paymentTerms,

        agency_ownership_terms: proposal.ownershipTerms,
    };
}