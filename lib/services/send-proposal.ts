import { supabaseAdmin } from "../supabase-server";

import { createProposalEmailTemplate } from "./email/proposal-email-template";
import { sendProposalEmail } from "./email/send-proposal";
import { createProposalPdf } from "./pdf/create-proposal-pdf";

import {
    createProposalRevision,
    getLatestProposalVersion,
} from "@/lib/repositories/proposal-versions";

import { dbToProposalDraft } from "@/lib/mappers/proposal-draft";
import { isProposalEqual } from "@/lib/proposals/is-proposal-equal";

export async function sendProposal(
    quoteId: string
) {
    // Quote
    const { data: quote, error: quoteError } =
        await supabaseAdmin
            .from("quotes")
            .select("*")
            .eq("id", quoteId)
            .single();

    if (quoteError || !quote) {
        throw new Error("Quote not found.");
    }

    // Current Draft
    const {
        data: draft,
        error: draftError,
    } = await supabaseAdmin
        .from("proposal_drafts")
        .select("*")
        .eq("quote_id", quoteId)
        .single();

    if (draftError || !draft) {
        throw new Error("Proposal draft not found.");
    }

    // Latest Version
    let version =
        await getLatestProposalVersion(quoteId);

    // Create a new version only if the draft changed
    if (
        !version ||
        !isProposalEqual(
            dbToProposalDraft(draft),
            dbToProposalDraft(version)
        )
    ) {
        version = await createProposalRevision({
            quoteId,
        });
    }

    const proposal =
        dbToProposalDraft(version);

    // PDF
    const pdfBuffer =
        await createProposalPdf({
            clientName: quote.name,

            projectType: quote.project_type,

            quoteUrl: "",

            summary: proposal.summary,

            estimatedTimeline:
                proposal.estimatedTimeline,

            estimatedCost:
                proposal.estimatedCost,

            complexity: proposal.complexity,

            deliverables:
                proposal.deliverables,

            techStack: proposal.techStack,

            phases: proposal.phases,

            clientResponsibilities:
                proposal.clientResponsibilities,

            risks: proposal.risks,

            nextSteps:
                proposal.nextSteps,
        });

    const html =
        createProposalEmailTemplate({
            clientName: quote.name,
            projectType: quote.project_type,
            quoteUrl: "",
            estimatedTimeline:
                proposal.estimatedTimeline,
            estimatedCost:
                proposal.estimatedCost,
        });

    await sendProposalEmail({
        to: quote.email,
        subject: `Your Project Proposal — ${quote.project_type ?? "Project"
            }`,
        html,
        pdfBuffer,
        filename: `proposal-${quote.name
            .toLowerCase()
            .replace(/\s+/g, "-")}.pdf`,
    });

    // Mark version as sent
    await supabaseAdmin
        .from("proposal_versions")
        .update({
            status: "sent",
            sent_at: new Date().toISOString(),
        })
        .eq("id", version.id);
}