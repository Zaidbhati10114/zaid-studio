// app/api/send-proposal/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { ProposalPDF } from "@/app/components/ProposalPDF";
import React from "react";

// ─── Nodemailer transporter ───────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            toEmail,
            clientName,
            projectType,
            quoteUrl,
            // Full quote fields for PDF
            summary,
            estimated_timeline,
            estimated_cost,
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
                { error: "Missing required fields: toEmail, clientName, quoteUrl" },
                { status: 400 }
            );
        }

        // ── Generate PDF buffer ────────────────────────────────────────────────
        const pdfBuffer = await renderToBuffer(
            createElement(ProposalPDF, {
                name: clientName,
                project_type: projectType,
                summary,
                estimated_timeline,
                estimated_cost,
                complexity,
                deliverables,
                tech_stack,
                phases,
                client_responsibilities,
                risks,
                next_steps,
                quoteUrl,
            }) as React.ReactElement<any>
        );

        // ── Send email ─────────────────────────────────────────────────────────
        await transporter.sendMail({
            from: `"Zaid Studio" <${process.env.GMAIL_USER}>`,
            to: toEmail,
            subject: `Your Project Proposal — ${projectType ?? "Project"}`,
            html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #171717;">
          <div style="margin-bottom: 24px;">
            <p style="font-size: 13px; color: #737373; margin: 0 0 4px;">Zaid Studio</p>
            <h1 style="font-size: 20px; font-weight: 600; margin: 0;">Your Project Proposal is Ready</h1>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #404040;">
            Hi ${clientName}, your proposal for <strong>${projectType ?? "your project"}</strong> is attached as a PDF. You can also view the full interactive version online:
          </p>

          <a
            href="${quoteUrl}"
            style="display: inline-block; margin: 16px 0; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500;"
          >
            View Full Proposal →
          </a>

          <div style="margin-top: 8px; padding: 14px 16px; background: #f5f5f5; border-radius: 8px;">
            <p style="font-size: 12px; color: #737373; margin: 0 0 6px;">Quick summary</p>
            <p style="font-size: 13px; margin: 0 0 4px;"><strong>Timeline:</strong> ${estimated_timeline ?? "To be confirmed"}</p>
            <p style="font-size: 13px; margin: 0;"><strong>Estimate:</strong> ${estimated_cost ?? "To be confirmed"}</p>
          </div>

          <p style="font-size: 13px; color: #404040; margin-top: 20px; line-height: 1.6;">
            Want to discuss this?
            <a href="https://wa.me/919503148821" style="color: #2563eb;">Chat on WhatsApp</a>
            or reply to this email — happy to walk you through it.
          </p>

          <p style="font-size: 12px; color: #a3a3a3; margin-top: 24px; border-top: 1px solid #e5e5e5; padding-top: 16px;">
            Zaid Studio · zaidstudio.vercel.app
          </p>
        </div>
      `,
            attachments: [
                {
                    filename: `proposal-${clientName.toLowerCase().replace(/\s+/g, "-")}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[send-proposal] error:", err);
        return NextResponse.json(
            { error: "Failed to send proposal. Please try again." },
            { status: 500 }
        );
    }
}