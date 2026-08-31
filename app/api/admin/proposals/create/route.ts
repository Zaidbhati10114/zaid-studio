export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import {
    generateQuote,
} from "@/lib/ai/quote-generator";

import type {
    QuoteFormData,
    GeneratedQuote,
} from "@/hooks/useQuote";

import {
    supabaseAdmin,
} from "@/lib/supabase-server";



import * as Sentry from "@sentry/nextjs";
import { createProposalFromQuote } from "@/lib/repositories/create-proposal";


interface AdminCreateProposalRequest
    extends QuoteFormData {
    adminNotes?: string;
}

function validateBody(
    body: Partial<AdminCreateProposalRequest>
): body is AdminCreateProposalRequest {
    const required = [
        "name",
        "email",
        "projectType",
        "stage",
        "timeline",
        "description",
    ] as const;

    return required.every(
        (key) =>
            typeof body[key] === "string" &&
            body[key]!.trim().length > 0
    );
}

export async function POST(
    req: NextRequest
) {
    try {
        const body: Partial<AdminCreateProposalRequest> =
            await req.json();

        if (!validateBody(body)) {
            return NextResponse.json(
                {
                    error:
                        "Please complete all required fields.",
                },
                {
                    status: 400,
                }
            );
        }

        // AI input
        const quoteInput = {
            ...body,
            adminNotes: body.adminNotes,
        };

        // Generate initial quote/estimate
        const generatedQuote: GeneratedQuote =
            await generateQuote(quoteInput);

        // Save quote
        const now = new Date().toISOString();

        const {
            data: quote,
            error: quoteError,
        } = await supabaseAdmin
            .from("quotes")
            .insert({
                name: body.name,
                email: body.email,
                project_type: body.projectType,
                description: body.description,

                summary:
                    generatedQuote.summary,

                estimated_timeline:
                    generatedQuote.estimatedTimeline,

                estimated_cost:
                    generatedQuote.estimatedCost,

                why_hire_me:
                    generatedQuote.whyHireMe,

                next_steps:
                    generatedQuote.nextSteps,

                complexity:
                    generatedQuote.complexity,

                deliverables:
                    generatedQuote.deliverables,

                tech_stack:
                    generatedQuote.techStack,

                phases:
                    generatedQuote.phases,

                client_responsibilities:
                    generatedQuote.clientResponsibilities,

                risks:
                    generatedQuote.risks,

                status: "new",

                notes:
                    body.adminNotes ?? null,

                last_generated_at: now,
            })
            .select("id")
            .single();

        if (quoteError || !quote) {
            throw quoteError ?? new Error(
                "Failed to create quote."
            );
        }

        // Create the initial working proposal draft
        const proposalResult =
            await createProposalFromQuote(
                quote.id
            );

        return NextResponse.json({
            success: true,

            quoteId: quote.id,

            draftId:
                proposalResult.draftId,

            created:
                proposalResult.created,
        });
    } catch (error) {
        console.error(
            "[admin-proposal-create]",
            error
        );

        Sentry.captureException(error, {
            tags: {
                layer: "admin_proposal_create",
            },
        });

        return NextResponse.json(
            {
                error:
                    "Failed to create proposal.",

                details:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            },
            {
                status: 500,
            }
        );
    }
}