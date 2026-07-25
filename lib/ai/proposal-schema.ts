export interface ProposalPhase {
    name: string;
    duration: string;
    tasks: string[];
}

export interface ProposalRisk {
    risk: string;
    mitigation: string;
}

export interface ProposalDraft {
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

    supportPolicy: string;

    paymentTerms: string;

    ownershipTerms: string;
}