import { ProposalPhase, ProposalRisk } from "../ai/proposal-schema";

export interface Quote {
    id: string;

    name: string;

    email: string;

    projectType: string;

    description: string;

    summary: string;

    estimatedTimeline: string;

    estimatedCost: string;

    complexity: "Simple" | "Medium" | "Complex";

    deliverables: string[];

    techStack: string[];

    phases: ProposalPhase[];

    clientResponsibilities: string[];

    risks: ProposalRisk[];

    nextSteps: string[];

    createdAt: string;
}