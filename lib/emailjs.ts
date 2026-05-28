// lib/sendProposal.ts
// Replaces lib/emailjs.ts — call this from QuoteClient

interface QuotePhase {
    name: string;
    duration: string;
}

interface QuoteRisk {
    risk: string;
    mitigation: string;
}

export interface SendProposalParams {
    toEmail: string;
    clientName: string;
    projectType: string;
    quoteUrl: string;
    // proposal content for PDF
    summary?: string;
    estimated_timeline?: string;
    estimated_cost?: string;
    complexity?: string;
    deliverables?: string[];
    tech_stack?: string[];
    phases?: QuotePhase[];
    client_responsibilities?: string[];
    risks?: QuoteRisk[];
    next_steps?: string[];
}

export async function sendProposal(params: SendProposalParams): Promise<void> {
    const res = await fetch("/api/send-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to send proposal. Please try again.");
    }
}