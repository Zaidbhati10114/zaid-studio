import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        const body = await request.json();
        const { client_name, company_role, agreed } = body;

        if (!client_name?.trim()) {
            return json({ error: "Full name is required." }, 400);
        }

        if (!agreed) {
            return json({ error: "You must accept the terms." }, 400);
        }

        // Find proposal draft by public slug
        const { data: proposal, error: proposalError } = await supabaseAdmin
            .from("proposal_drafts")
            .select("id, quote_id, slug")
            .eq("slug", slug)
            .single();

        if (proposalError || !proposal) {
            return json({ error: "Proposal not found." }, 404);
        }

        // Prevent duplicate acceptance
        const { data: existingAcceptance } = await supabaseAdmin
            .from("proposal_acceptances")
            .select("id")
            .eq("proposal_slug", slug)
            .limit(1)
            .maybeSingle();

        if (existingAcceptance) {
            return json({ error: "Proposal already accepted." }, 409);
        }

        // Current terms version
        const { data: settings } = await supabaseAdmin
            .from("agency_settings")
            .select("value")
            .eq("key", "terms_version")
            .single();

        const termsVersion = settings?.value ?? "v1.0";

        // Save acceptance
        const { error: acceptanceError } = await supabaseAdmin
            .from("proposal_acceptances")
            .insert({
                token: crypto.randomUUID(),

                quote_id: proposal.quote_id,
                proposal_draft_id: proposal.id,
                proposal_slug: proposal.slug,

                client_name: client_name.trim(),
                company_role: company_role?.trim() || null,

                signature_text: client_name.trim(),
                acceptance_method: "typed_consent",

                terms_version: termsVersion,

                accepted_at: new Date().toISOString(),
                expires_at: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toISOString(),

                user_agent: request.headers.get("user-agent"),
                ip_address:
                    request.headers.get("x-forwarded-for") ??
                    request.headers.get("x-real-ip"),

                used: true,
            });

        if (acceptanceError) {
            throw acceptanceError;
        }

        return json({
            success: true,
            status: "accepted",
            acceptedAt: new Date().toISOString(),
            termsVersion,
        });
    } catch (error) {
        console.error({
            tag: "PROPOSAL_ACCEPT_ERROR",
            slug,
            error,
        });

        return json({ error: "Internal server error." }, 500);
    }
}