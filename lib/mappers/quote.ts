// lib/mappers/quote.ts

import type { ProposalGenerationInput } from "@/lib/types";
import { Quote } from "../models/quote";

export interface QuoteDTO {
    id: string;

    name: string;

    email: string;

    projectType: string;

    description: string;

    summary: string;

    estimatedTimeline: string;

    estimatedCost: string;

    complexity: string;

    deliverables: string[];

    techStack: string[];

    phases: ProposalGenerationInput["phases"];

    clientResponsibilities: string[];

    risks: ProposalGenerationInput["risks"];

    nextSteps: string[];

    createdAt: string;
}


export function mapQuoteRow(row: any): Quote {
    return {
        id: row.id,

        name: row.name,

        email: row.email,

        projectType: row.project_type,

        description: row.description,

        summary: row.summary,

        estimatedTimeline: row.estimated_timeline,

        estimatedCost: row.estimated_cost,

        complexity: row.complexity,

        deliverables: row.deliverables ?? [],

        techStack: row.tech_stack ?? [],

        phases: row.phases ?? [],

        clientResponsibilities:
            row.client_responsibilities ?? [],

        risks: row.risks ?? [],

        nextSteps: row.next_steps ?? [],

        createdAt: row.created_at,
    };
}