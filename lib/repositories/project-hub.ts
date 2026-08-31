import type { ProposalDraft } from "@/lib/ai/proposal-schema";
import type { Quote } from "@/lib/models/quote";

import { dbToProposalDraft } from "@/lib/mappers/proposal-draft";
import { supabaseAdmin } from "../supabase-server";
import { ProposalVersion } from "@/hooks/useProposal";



export interface ProjectHubData {
    quote: Quote;
    proposalDraft: ProposalDraft | null;
    versions: ProposalVersion[];
}

export async function getProjectHubData(
    quoteId: string
): Promise<ProjectHubData> {
    const [
        { data: quote, error: quoteError },
        { data: draft, error: draftError },
        { data: versions, error: versionsError },
    ] = await Promise.all([
        supabaseAdmin
            .from("quotes")
            .select("*")
            .eq("id", quoteId)
            .single(),

        supabaseAdmin
            .from("proposal_drafts")
            .select("*")
            .eq("quote_id", quoteId)
            .maybeSingle(),

        supabaseAdmin
            .from("proposal_versions")
            .select(
                "id, version_number, status, base_version_id, created_at, sent_at"
            )
            .eq("quote_id", quoteId)
            .order("version_number", { ascending: false }),
    ]);

    if (quoteError) throw quoteError;
    if (draftError) throw draftError;
    if (versionsError) throw versionsError;

    return {
        quote,
        proposalDraft: draft ? dbToProposalDraft(draft) : null,
        versions:
            versions?.map((v) => ({
                id: v.id,
                versionNumber: v.version_number,
                status: v.status,
                baseVersionId: v.base_version_id,
                createdAt: v.created_at,
                sentAt: v.sent_at,
            })) ?? [],
    };
}