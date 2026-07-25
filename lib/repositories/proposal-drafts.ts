// lib/repositories/proposal-drafts.ts

import { supabaseAdmin } from "@/lib/supabase-server";
import type { ProposalDraft } from "@/lib/ai/proposal-schema";
import { proposalDraftToDb } from "@/lib/mappers/proposal-draft";
interface UpsertProposalDraftParams {
    quoteId: string;
    proposal: ProposalDraft;
}



export async function upsertProposalDraft({
    quoteId,
    proposal,
}: UpsertProposalDraftParams) {
    const now = new Date().toISOString();
    const { data: existing, error: existingError } = await supabaseAdmin
        .from("proposal_drafts")
        .select("id")
        .eq("quote_id", quoteId)
        .maybeSingle();

    if (existingError) {
        throw existingError;
    }

    const payload = {
        ...proposalDraftToDb(proposal),

        generated_at: now,
        updated_at: now,
        last_generated_at: now,
    };

    let draftId: string
    if (existing) {
        draftId = existing.id;
        const { error } = await supabaseAdmin
            .from("proposal_drafts")
            .update(payload)
            .eq("id", existing.id);

        if (error) throw error;
    } else {
        const { data, error } = await supabaseAdmin
            .from("proposal_drafts")
            .insert({
                quote_id: quoteId,
                ...payload,
            }).select("id").single();

        if (error) throw error;
        draftId = data.id;
    }

    const { error: quoteError } = await supabaseAdmin
        .from("quotes")
        .update({
            last_generated_at: now,
        })
        .eq("id", quoteId);

    if (quoteError) {
        throw quoteError;
    }

    return {
        success: true,
        draftId,
    };
}

