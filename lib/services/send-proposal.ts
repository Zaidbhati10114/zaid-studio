import { supabaseAdmin } from "../supabase-server";
import { createProposalEmailTemplate } from "./email/proposal-email-template";
import { sendProposalEmail } from "./email/send-proposal";
import { createProposalPdf } from "./pdf/create-proposal-pdf";

export async function sendProposal(
    quoteId: string
) {
    const { data: quote, error: quoteError } =
        await supabaseAdmin
            .from("quotes")
            .select("*")
            .eq("id", quoteId)
            .single();

    if (quoteError || !quote) {
        throw new Error("Quote not found.");
    }





    const {
        data: proposal,
        error: proposalError,
    } = await supabaseAdmin
        .from("proposal_drafts")
        .select("*")
        .eq("quote_id", quoteId)
        .single();

    if (proposalError || !proposal) {
        throw new Error("Proposal draft not found.");
    }

    const pdfBuffer = await createProposalPdf({
        clientName: quote.name,

        projectType: quote.project_type,

        quoteUrl: "",

        summary: proposal.summary,

        estimatedTimeline: proposal.estimated_timeline,

        estimatedCost: proposal.estimated_cost,

        complexity: proposal.complexity,

        deliverables: proposal.deliverables,

        techStack: proposal.tech_stack,

        phases: proposal.phases,

        clientResponsibilities: proposal.client_responsibilities,

        risks: proposal.risks,

        nextSteps: proposal.next_steps,
    });


    const html = createProposalEmailTemplate({
        clientName: quote.name,
        projectType: quote.project_type,
        quoteUrl: "", // we'll replace this later with the real public proposal URL
        estimatedTimeline: proposal.estimated_timeline,
        estimatedCost: proposal.estimated_cost,
    });

    await sendProposalEmail({
        to: quote.email,
        subject: `Your Project Proposal — ${quote.project_type ?? "Project"}`,
        html,
        pdfBuffer,
        filename: `proposal-${quote.name
            .toLowerCase()
            .replace(/\s+/g, "-")}.pdf`,
    });
}