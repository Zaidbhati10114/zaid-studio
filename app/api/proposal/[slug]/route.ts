import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        // Find proposal version by public slug
        const { data: version, error: versionError } = await supabaseAdmin
            .from("proposal_versions")
            .select("*")
            .eq("slug", slug)
            .single();

        if (versionError || !version) {
            return json({ error: "Proposal not found." }, 404);
        }

        // Get quote (client/business information)
        const { data: quote } = await supabaseAdmin
            .from("quotes")
            .select("id,name,project_type")
            .eq("id", version.quote_id)
            .single();

        // Get current working draft (for editable fields like policies)
        const { data: proposalDraft } = await supabaseAdmin
            .from("proposal_drafts")
            .select("*")
            .eq("quote_id", version.quote_id)
            .maybeSingle();

        // Terms version
        const { data: settings } = await supabaseAdmin
            .from("agency_settings")
            .select("value")
            .eq("key", "terms_version")
            .single();

        // Existing acceptance (if already accepted)
        const { data: acceptance } = await supabaseAdmin
            .from("proposal_acceptances")
            .select("client_name,accepted_at")
            .eq("quote_id", version.quote_id)
            .order("accepted_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        return json({
            success: true,

            proposal: {
                slug,
                client_name: quote?.name ?? "Client",
                business_name: quote?.project_type ?? "Project",
                status: version.status,
            },

            proposalDraft,

            termsVersion: settings?.value ?? "v1.0",

            acceptance: {
                accepted: !!acceptance,
                acceptedAt: acceptance?.accepted_at ?? null,
                acceptedBy: acceptance?.client_name ?? null,
            },
        });
    } catch (error) {
        console.error({
            tag: "PUBLIC_PROPOSAL_READ_ERROR",
            slug,
            error,
        });

        return json({ error: "Internal server error." }, 500);
    }
}