import { supabaseAdmin } from "@/lib/supabase-server";

interface CreateProposalRevisionParams {
    quoteId: string;
}

export async function getLatestProposalVersion(quoteId: string) {
    const { data, error } = await supabaseAdmin
        .from("proposal_versions")
        .select("*")
        .eq("quote_id", quoteId)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;

    return data;
}

export async function createProposalRevision({
    quoteId,
}: CreateProposalRevisionParams) {
    // Current working draft
    const { data: draft, error: draftError } = await supabaseAdmin
        .from("proposal_drafts")
        .select("*")
        .eq("quote_id", quoteId)
        .single();

    if (draftError || !draft) {
        throw new Error("Proposal draft not found.");
    }

    const latestVersion = await getLatestProposalVersion(quoteId);

    const versionNumber = latestVersion
        ? latestVersion.version_number + 1
        : 0;

    const baseVersionId = latestVersion?.id ?? null;

    const { data, error } = await supabaseAdmin
        .from("proposal_versions")
        .insert({
            quote_id: quoteId,
            proposal_draft_id: draft.id,

            version_number: versionNumber,
            base_version_id: baseVersionId,
            status: "saved",

            summary: draft.summary,
            estimated_timeline: draft.estimated_timeline,
            estimated_cost: draft.estimated_cost,
            complexity: draft.complexity,

            deliverables: draft.deliverables,
            tech_stack: draft.tech_stack,
            phases: draft.phases,
            client_responsibilities: draft.client_responsibilities,
            risks: draft.risks,

            agency_support_policy: draft.agency_support_policy,
            agency_payment_terms: draft.agency_payment_terms,
            agency_ownership_terms: draft.agency_ownership_terms,

            next_steps: draft.next_steps,
            meeting_notes: draft.meeting_notes,
        })
        .select("*")
        .single();

    if (error) throw error;

    return data;
}

export async function getProposalVersions(quoteId: string) {
    const { data, error } = await supabaseAdmin
        .from("proposal_versions")
        .select("*")
        .eq("quote_id", quoteId)
        .order("version_number", { ascending: true });

    if (error) throw error;

    return data ?? [];
}

export async function getProposalVersion(versionId: string) {
    const { data, error } = await supabaseAdmin
        .from("proposal_versions")
        .select("*")
        .eq("id", versionId)
        .single();

    if (error) throw error;

    return data;
}