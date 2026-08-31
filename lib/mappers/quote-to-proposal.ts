import { ProposalPhase, ProposalRisk } from "../ai/proposal-schema";
import { ProposalGenerationInput } from "../types";
import type { QuoteRow } from "@/lib/repositories/quotes";
// interface QuoteRow {
//     id: string;

//     name: string;
//     project_type: string;
//     description: string;

//     summary: string;
//     estimated_timeline: string;
//     estimated_cost: string;
//     complexity: string;

//     deliverables: string[];
//     tech_stack: string[];

//     phases: unknown;
//     client_responsibilities: string[];
//     risks: unknown;

//     next_steps: string[];
// }


function ensureArray<T>(value: unknown): T[] {
    if (Array.isArray(value)) {
        return value as T[];
    }

    if (typeof value === "string") {
        return JSON.parse(value) as T[];
    }

    return [];
}

export function mapQuoteToProposalInput(
    quote: QuoteRow,
    meetingNotes?: string
): ProposalGenerationInput {

    return {
        quoteId: quote.id,

        clientName: quote.name,

        projectType: quote.project_type,

        description: quote.description,

        summary: quote.summary,

        estimatedTimeline: quote.estimated_timeline,

        estimatedCost: quote.estimated_cost,

        complexity: quote.complexity,

        deliverables: quote.deliverables,

        techStack: quote.tech_stack,

        phases: ensureArray<ProposalPhase>(quote.phases),

        clientResponsibilities: quote.client_responsibilities,

        risks: ensureArray<ProposalRisk>(quote.risks),

        nextSteps: quote.next_steps,

        meetingNotes,
    };
}