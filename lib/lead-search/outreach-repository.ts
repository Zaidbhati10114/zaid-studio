import { supabaseAdmin } from "@/lib/supabase-server";

export async function getOutreach(campaignLeadId: string) {
    const { data, error } = await supabaseAdmin
        .from("lead_outreach")
        .select("*")
        .eq("campaign_lead_id", campaignLeadId)
        .maybeSingle();

    if (error) throw error;

    return data;
}

export async function saveOutreach({
    campaignLeadId,
    emailSubject,
    emailBody,
    whatsapp,
    linkedin,
}: {
    campaignLeadId: string;
    emailSubject: string;
    emailBody: string;
    whatsapp: string;
    linkedin: string;
}) {
    const { error } = await supabaseAdmin
        .from("lead_outreach")
        .upsert(
            {
                campaign_lead_id: campaignLeadId,
                email_subject: emailSubject,
                email_body: emailBody,
                whatsapp,
                linkedin,
                updated_at: new Date().toISOString(),
            },
            {
                onConflict: "campaign_lead_id",
            },
        );

    if (error) throw error;
}