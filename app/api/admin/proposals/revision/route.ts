export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createProposalRevision } from "@/lib/repositories/proposal-versions";

interface CreateRevisionRequest {
    quoteId: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: CreateRevisionRequest = await req.json();

        if (!body.quoteId) {
            return NextResponse.json(
                { error: "quoteId is required" },
                { status: 400 }
            );
        }

        const version = await createProposalRevision({
            quoteId: body.quoteId,
        });

        return NextResponse.json({
            success: true,
            version: {
                id: version.id,
                versionNumber: version.version_number,
                status: version.status,
            },
        });

    } catch (error) {
        console.error("[proposal-revision]", error);

        return NextResponse.json(
            {
                error: "Failed to create revision",
                details:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            },
            { status: 500 }
        );
    }
}