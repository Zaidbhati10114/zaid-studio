import { supabaseAdmin } from "@/lib/supabase-server";
import { AGENCY_DEFAULTS } from "@/lib/ai/agency-defaults";
import { getQuoteById } from "@/lib/repositories/quotes";

export async function createProposalFromQuote(
    quoteId: string
) {
    // Verify quote exists
    const quote = await getQuoteById(quoteId);

    // Don't create a second draft
    const { data: existingDraft, error: existingError } =
        await supabaseAdmin
            .from("proposal_drafts")
            .select("id")
            .eq("quote_id", quoteId)
            .maybeSingle();

    if (existingError) {
        throw existingError;
    }

    if (existingDraft) {
        return {
            created: false,
            draftId: existingDraft.id,
        };
    }

    const now = new Date().toISOString();

    const { data: draft, error } = await supabaseAdmin
        .from("proposal_drafts")
        .insert({
            quote_id: quote.id,

            // Initial proposal content from the quote
            summary: quote.summary,
            estimated_timeline: quote.estimated_timeline,
            estimated_cost: quote.estimated_cost,
            complexity: quote.complexity,

            deliverables: quote.deliverables ?? [],
            tech_stack: quote.tech_stack ?? [],
            phases: quote.phases ?? [],
            client_responsibilities:
                quote.client_responsibilities ?? [],
            risks: quote.risks ?? [],

            // Proposal-specific defaults
            agency_support_policy:
                AGENCY_DEFAULTS.supportPolicy,

            agency_payment_terms:
                AGENCY_DEFAULTS.paymentTerms,

            agency_ownership_terms:
                AGENCY_DEFAULTS.ownershipTerms,

            next_steps: quote.next_steps ?? [],

            meeting_notes: null,

            ai_generated: false,

            generated_at: null,

            created_at: now,
            updated_at: now,
            last_generated_at: null,
        })
        .select("id")
        .single();

    if (error) {
        throw error;
    }

    return {
        created: true,
        draftId: draft.id,
    };
}