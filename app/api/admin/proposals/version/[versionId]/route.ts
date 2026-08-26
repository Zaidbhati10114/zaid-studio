export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getProposalVersion } from "@/lib/repositories/proposal-versions";
import { dbToProposalDraft } from "@/lib/mappers/proposal-draft";

export async function GET(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ versionId: string }>;
    }
) {
    try {
        const { versionId } = await params;

        const version = await getProposalVersion(versionId);

        return NextResponse.json({
            id: version.id,
            versionNumber: version.version_number,
            status: version.status,
            baseVersionId: version.base_version_id,

            ...dbToProposalDraft(version),
        });

    } catch (error) {
        return NextResponse.json(
            {
                error: "Version not found.",
                details:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            },
            { status: 404 }
        );
    }
}