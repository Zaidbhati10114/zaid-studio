export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getQuoteById } from "@/lib/repositories/quotes";
import { mapQuoteToProposalInput } from "@/lib/mappers/quote-to-proposal";
import { generateProposal } from "@/lib/ai/proposal-generator";


interface GenerateProposalRequest {
    quoteId: string;
    adminNotes?: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: GenerateProposalRequest = await req.json();

        if (!body.quoteId) {
            return NextResponse.json(
                {
                    error: "quoteId is required",
                },
                {
                    status: 400,
                }
            );
        }

        // 1. Load Quote
        const quote = await getQuoteById(body.quoteId);

        // 2. Map DB → AI Input
        const proposalInput = mapQuoteToProposalInput(
            quote,
            body.adminNotes
        );

        // 3. Generate Proposal
        const proposal = await generateProposal(
            proposalInput
        );

        return NextResponse.json({
            success: true,
            proposal,
        });

    } catch (error) {
        console.error("[proposal-generator]", error);

        return NextResponse.json(
            {
                error: "Failed to generate proposal",
            },
            {
                status: 500,
            }
        );
    }
}