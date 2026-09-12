import { NextRequest } from "next/server";
import { generateOutreach } from "@/lib/lead-search/outreach-generator";

export async function POST(
    request: NextRequest,
) {
    try {
        const body = await request.json();

        const outreach =
            await generateOutreach(body);

        return Response.json({
            success: true,
            outreach,
        });
    } catch (error) {
        return Response.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Outreach generation failed.",
            },
            { status: 500 },
        );
    }
}