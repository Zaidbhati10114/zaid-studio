export const runtime = "nodejs";

import { sendProposal } from "@/lib/services/send-proposal";
import { NextRequest, NextResponse } from "next/server";



interface SendProposalRequest {
    quoteId: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: SendProposalRequest = await req.json();

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

        await sendProposal(body.quoteId);

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("[proposal-send]", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to send proposal",
            },
            {
                status: 500,
            }
        );
    }
}