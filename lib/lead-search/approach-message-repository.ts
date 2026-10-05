import { supabaseAdmin } from "@/lib/supabase-server";

export async function createApproachMessage({
    approachLeadId,
    content,
}: {
    approachLeadId: string;
    content: string;
}) {
    const { data, error } = await supabaseAdmin
        .from("approach_messages")
        .insert({
            approach_lead_id: approachLeadId,
            content,
            selected: false,
        })
        .select("*")
        .single();

    if (error) throw error;

    return data;
}

export async function getApproachMessages(
    approachLeadId: string,
) {
    const { data, error } = await supabaseAdmin
        .from("approach_messages")
        .select("*")
        .eq("approach_lead_id", approachLeadId)
        .order("created_at", {
            ascending: false,
        });

    if (error) throw error;

    return data ?? [];
}

export async function selectApproachMessage({
    approachLeadId,
    messageId,
}: {
    approachLeadId: string;
    messageId: string;
}) {
    // First make sure the message actually belongs to this lead.
    const { data: message, error: messageError } = await supabaseAdmin
        .from("approach_messages")
        .select("id")
        .eq("id", messageId)
        .eq("approach_lead_id", approachLeadId)
        .maybeSingle();

    if (messageError) throw messageError;

    if (!message) {
        throw new Error("Approach message not found for this lead.");
    }

    // Clear the current selection for this lead.
    const { error: clearError } = await supabaseAdmin
        .from("approach_messages")
        .update({
            selected: false,
        })
        .eq("approach_lead_id", approachLeadId);

    if (clearError) throw clearError;

    // Select the requested message.
    const { data, error } = await supabaseAdmin
        .from("approach_messages")
        .update({
            selected: true,
        })
        .eq("id", messageId)
        .eq("approach_lead_id", approachLeadId)
        .select("*")
        .single();

    if (error) throw error;

    return data;
}