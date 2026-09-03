import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function isAuthed(request: NextRequest) {
    return (
        request.cookies.get("admin_session")?.value ===
        process.env.ADMIN_PASSWORD
    );
}

export async function GET(request: NextRequest) {
    if (!isAuthed(request)) {
        return json({ error: "Unauthorized" }, 401);
    }

    const quoteId = request.nextUrl.searchParams.get("quoteId");

    if (!quoteId) {
        return json({ error: "quoteId is required." }, 400);
    }

    try {
        const { data: quote, error: quoteError } = await supabaseAdmin
            .from("quotes")
            .select("*")
            .eq("id", quoteId)
            .single();

        if (quoteError || !quote) {
            return json({ error: "Quote not found." }, 404);
        }

        const { data: proposalDraft } = await supabaseAdmin
            .from("proposal_drafts")
            .select(`
    id,
    quote_id,
    status,
    estimated_cost,
    estimated_timeline,
    slug,
    sent,
    updated_at
  `)
            .eq("quote_id", quoteId)
            .maybeSingle();

        const { data: proposalVersions } = await supabaseAdmin
            .from("proposal_versions")
            .select(`
    id,
    version_number,
    status,
    slug,
    sent,
    sent_at,
    accepted_at,
    viewed_at,
    view_count
  `)
            .eq("quote_id", quoteId)
            .order("version_number", { ascending: false });

        const { data: proposalAcceptances } = await supabaseAdmin
            .from("proposal_acceptances")
            .select("*")
            .eq("quote_id", quoteId)
            .order("accepted_at", { ascending: false });

        return json({
            success: true,
            quote,
            proposalDraft,
            proposalVersions: proposalVersions ?? [],
            proposalAcceptances: proposalAcceptances ?? [],
        });
    } catch (error) {
        console.error({
            tag: "QUOTE_SEARCH_ERROR",
            quoteId,
            error,
        });

        return json({ error: "Internal server error." }, 500);
    }
}