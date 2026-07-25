export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { upsertProposalDraft } from "@/lib/repositories/proposal-drafts";

import type { SaveProposalDraftRequest } from "@/lib/types";


export async function POST(req: NextRequest) {
    try {
        const body: SaveProposalDraftRequest = await req.json();

        if (!body.quoteId) {
            return NextResponse.json(
                { error: "quoteId is required" },
                { status: 400 }
            );
        }

        if (!body.proposal) {
            return NextResponse.json(
                { error: "proposal is required" },
                { status: 400 }
            );
        }

        const result = await upsertProposalDraft({
            quoteId: body.quoteId,
            proposal: body.proposal,
        });

        return NextResponse.json({
            success: true,
            draftId: result.draftId,
        });

    } catch (error) {
        console.error("[proposal-save]", error);

        return NextResponse.json(
            {
                error: "Failed to save proposal",
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