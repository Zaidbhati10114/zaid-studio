// app/api/send-proposal/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { createProposalPdf } from "@/lib/services/pdf/create-proposal-pdf";

import { createProposalEmailTemplate } from "@/lib/services/email/proposal-email-template";
import { sendProposalEmail } from "@/lib/services/email/send-proposal";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            toEmail,
            clientName,
            projectType,
            quoteUrl,

            summary,
            estimated_timeline,
            estimated_cost,
            quoteId,
            complexity,
            deliverables,
            tech_stack,
            phases,
            client_responsibilities,
            risks,
            next_steps,
        } = body;

        if (!toEmail || !clientName || !quoteUrl) {
            return NextResponse.json(
                {
                    error: "Missing required fields: toEmail, clientName, quoteUrl",
                },
                {
                    status: 400,
                }
            );
        }

        if (!quoteId) {
            return NextResponse.json(
                {
                    error: "Missing quoteId",
                },
                {
                    status: 400,
                }
            );
        }

        // Generate PDF

        const pdfBuffer = await createProposalPdf({
            clientName,

            projectType,

            quoteUrl,

            summary,

            estimatedTimeline: estimated_timeline,

            estimatedCost: estimated_cost,

            complexity,

            deliverables,

            techStack: tech_stack,

            phases,

            clientResponsibilities: client_responsibilities,

            risks,

            nextSteps: next_steps,
        });

        // Generate email HTML

        const html = createProposalEmailTemplate({
            clientName,

            projectType,

            quoteUrl,

            estimatedTimeline: estimated_timeline,

            estimatedCost: estimated_cost,
        });

        // Send email

        await sendProposalEmail({
            to: toEmail,

            subject: `Your Project Proposal — ${projectType ?? "Project"}`,

            html,

            pdfBuffer,

            filename: `proposal-${clientName
                .toLowerCase()
                .replace(/\s+/g, "-")}.pdf`,
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("[send-proposal]", error);

        return NextResponse.json(
            {
                error: "Failed to send proposal. Please try again.",
            },
            {
                status: 500,
            }
        );
    }
}