import { NextRequest } from "next/server";

import { fetchWebsiteHtml } from "@/lib/lead-search/website-fetcher";
import { extractWebsiteEvidence } from "@/lib/lead-search/html-extractor";
import { detectRenderer } from "@/lib/lead-search/renderer-detector";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body?.url) {
            return Response.json(
                {
                    success: false,
                    error: "Missing 'url' in request body.",
                },
                { status: 400 },
            );
        }

        const html = await fetchWebsiteHtml(body.url);

        const evidence = extractWebsiteEvidence(html);
        const renderer = detectRenderer(html);
        return Response.json({
            success: true,
            renderer,
            htmlLength: html.length,
            evidence,
        });;
    } catch (error) {
        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}