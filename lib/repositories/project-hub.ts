import type { ProposalDraft } from "@/lib/ai/proposal-schema";
import { supabaseAdmin } from "../supabase-server";
import type { Quote } from "@/lib/models/quote";
import { dbToProposalDraft } from "@/lib/mappers/proposal-draft";
export interface ProjectHubData {
    quote: Quote; // we'll replace this with Quote later
    proposalDraft: ProposalDraft | null;
}


export async function getProjectHubData(
    quoteId: string
): Promise<ProjectHubData> {
    const { data: quote, error: quoteError } = await supabaseAdmin
        .from("quotes")
        .select("*")
        .eq("id", quoteId)
        .single();

    const { data: draft, error: draftError } = await supabaseAdmin
        .from("proposal_drafts")
        .select("*")
        .eq("quote_id", quoteId)
        .maybeSingle();

    return {
        quote,
        proposalDraft: draft ? dbToProposalDraft(draft) : null,
    };
}