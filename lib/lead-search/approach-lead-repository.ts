import { supabaseAdmin } from "@/lib/supabase-server";

export async function createApproachLead({
    businessName,
    businessDetails,
    hasWebsite,
    extraNotes,
}: {
    businessName: string;
    businessDetails: string;
    hasWebsite: boolean;
    extraNotes?: string | null;
}) {
    const { data, error } = await supabaseAdmin
        .from("approach_leads")
        .insert({
            business_name: businessName,
            business_details: businessDetails,
            has_website: hasWebsite,
            extra_notes: extraNotes ?? null,
            status: "new",
        })
        .select("*")
        .single();

    if (error) throw error;

    return data;
}

export async function getApproachLead(id: string) {
    const { data, error } = await supabaseAdmin
        .from("approach_leads")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;

    return data;
}


export const APPROACH_LEAD_STATUSES = [
    "new",
    "contacted",
    "replied",
    "interested",
    "not_interested",
] as const;

export type ApproachLeadStatus =
    (typeof APPROACH_LEAD_STATUSES)[number];

export async function updateApproachLeadStatus({
    id,
    status,
}: {
    id: string;
    status: ApproachLeadStatus;
}) {
    const { data, error } = await supabaseAdmin
        .from("approach_leads")
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw error;

    return data;
}


export async function getApproachLeads() {
    const { data, error } = await supabaseAdmin
        .from("approach_leads")
        .select(`
            *,
            approach_messages (
                id,
                content,
                selected,
                created_at
            )
        `)
        .order("created_at", {
            ascending: false,
        });

    if (error) throw error;

    return (data ?? []).map((lead) => {
        const messages: Array<{
            id: string;
            content: string;
            selected: boolean;
            created_at: string;
        }> = Array.isArray(lead.approach_messages)
                ? lead.approach_messages
                : [];

        const selectedMessage =
            messages.find((message) => message.selected) ?? null;

        return {
            ...lead,
            message_count: messages.length,
            selected_message: selectedMessage,
            approach_messages: undefined,
        };
    });
}


export async function deleteApproachLead(id: string) {
    const { data, error } = await supabaseAdmin
        .from("approach_leads")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

    if (error) throw error;

    if (!data) {
        throw new Error("Approach lead not found.");
    }

    return data;
}