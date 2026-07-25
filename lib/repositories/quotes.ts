// lib/repositories/quotes.ts

import { supabaseAdmin } from "@/lib/supabase-server";

export interface QuoteRow {
    id: string;

    name: string;
    email: string;

    project_type: string;
    description: string;

    summary: string;
    estimated_timeline: string;
    estimated_cost: string;
    complexity: string;
    why_hire_me: string | null;

    deliverables: string[];
    tech_stack: string[];

    phases: unknown;

    client_responsibilities: string[];

    risks: unknown;

    next_steps: string[];

    status: string;

    notes: string | null;

    created_at: string;

    last_generated_at: string | null;

    proposal_sending_at: string | null;
}

export async function getQuoteById(id: string): Promise<QuoteRow> {
    const { data, error } = await supabaseAdmin
        .from("quotes")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        throw error;
    }

    return data as QuoteRow;
}