import { NextRequest, NextResponse } from "next/server";

import { getProjectHubData } from "@/lib/repositories/project-hub";


export async function GET(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            quoteId: string;
        }>;
    }
) {

    const { quoteId } = await params;

    try {

        const data =
            await getProjectHubData(quoteId);

        return NextResponse.json(data);

    } catch (err) {

        return NextResponse.json(
            {
                error: "Unable to load proposal.",
                details:
                    err instanceof Error
                        ? err.message
                        : "Unknown error",
            },
            {
                status: 500,
            }
        );

    }

}