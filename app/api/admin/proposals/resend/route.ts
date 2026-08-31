export const runtime = "nodejs";

import { sendProposalVersion } from "@/lib/services/email/send-proposal";
import { NextRequest, NextResponse } from "next/server";


interface ResendProposalRequest {
    versionId: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: ResendProposalRequest = await req.json();

        if (!body.versionId) {
            return NextResponse.json(
                {
                    error: "versionId is required",
                },
                {
                    status: 400,
                }
            );
        }

        const result = await sendProposalVersion(body.versionId);

        return NextResponse.json(result);
    } catch (error) {
        console.error("[proposal-resend]", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to resend proposal",
            },
            {
                status: 500,
            }
        );
    }
}