import nodemailer from "nodemailer";
import { getProposalVersion } from "@/lib/repositories/proposal-versions";
import { dbToProposalDraft } from "@/lib/mappers/proposal-draft";
import { createProposalPdf } from "../pdf/create-proposal-pdf";
import { createProposalEmailTemplate } from "./proposal-email-template";
import { supabaseAdmin } from "@/lib/supabase-server";
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface SendProposalEmailParams {
    to: string;
    subject: string;
    html: string;
    pdfBuffer?: Buffer;
    filename?: string;
}

export async function sendProposalEmail({
    to,
    subject,
    html,
    pdfBuffer,
    filename,
}: SendProposalEmailParams) {
    await transporter.sendMail({
        from: `"Zaid Studio" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,

        attachments: [
            {
                filename,
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ],
    });
}



export async function sendProposalVersion(versionId: string) {
    // Load immutable version
    const version = await getProposalVersion(versionId);

    if (!version) {
        throw new Error("Proposal version not found.");
    }

    // Load quote
    const { data: quote, error: quoteError } = await supabaseAdmin
        .from("quotes")
        .select("*")
        .eq("id", version.quote_id)
        .single();

    if (quoteError || !quote) {
        throw new Error("Quote not found.");
    }

    const proposal = dbToProposalDraft(version);

    // Generate PDF from the immutable snapshot
    const pdfBuffer = await createProposalPdf({
        clientName: quote.name,
        projectType: quote.project_type,
        quoteUrl: "",
        summary: proposal.summary,
        estimatedTimeline: proposal.estimatedTimeline,
        estimatedCost: proposal.estimatedCost,
        complexity: proposal.complexity,
        deliverables: proposal.deliverables,
        techStack: proposal.techStack,
        phases: proposal.phases,
        clientResponsibilities: proposal.clientResponsibilities,
        risks: proposal.risks,
        nextSteps: proposal.nextSteps,
    });

    const html = createProposalEmailTemplate({
        clientName: quote.name,
        projectType: quote.project_type,
        quoteUrl: "",
        estimatedTimeline: proposal.estimatedTimeline,
        estimatedCost: proposal.estimatedCost,
    });

    await sendProposalEmail({
        to: quote.email,
        subject: `Your Project Proposal — ${quote.project_type ?? "Project"}`,
        html,
        pdfBuffer,
        filename: `proposal-v${version.version_number}-${quote.name
            .toLowerCase()
            .replace(/\s+/g, "-")}.pdf`,
    });

    // Refresh the sent timestamp
    await supabaseAdmin
        .from("proposal_versions")
        .update({
            status: "sent",
            sent_at: new Date().toISOString(),
        })
        .eq("id", version.id);

    return {
        success: true,
        versionNumber: version.version_number,
    };
}