import { supabaseAdmin } from "@/lib/supabase-server";

interface CompleteJobInput {
    jobId: string;

    found: number;
    newBusinesses: number;
    updatedBusinesses: number;
    linkedBusinesses: number;
    skippedBusinesses: number;

    apiRequests: number;
}

export async function startImportJob(
    campaignId: string,
    provider: string,
    query: string,
) {
    const { data, error } = await supabaseAdmin
        .from("lead_import_jobs")
        .insert({
            campaign_id: campaignId,
            provider,
            query,
        })
        .select("id")
        .single();

    if (error) throw error;

    return data.id;
}

export async function completeImportJob({
    jobId,
    found,
    newBusinesses,
    updatedBusinesses,
    linkedBusinesses,
    skippedBusinesses,
    apiRequests,
}: CompleteJobInput) {
    const { error } = await supabaseAdmin
        .from("lead_import_jobs")
        .update({
            status: "success",

            finished_at: new Date().toISOString(),

            api_requests: apiRequests,

            found,
            new_businesses: newBusinesses,
            updated_businesses: updatedBusinesses,
            linked_businesses: linkedBusinesses,
            skipped_businesses: skippedBusinesses,
        })
        .eq("id", jobId);

    if (error) throw error;
}

export async function failImportJob(
    jobId: string,
    message: string,
) {
    const { error } = await supabaseAdmin
        .from("lead_import_jobs")
        .update({
            status: "failed",
            finished_at: new Date().toISOString(),
            error_message: message,
        })
        .eq("id", jobId);

    if (error) throw error;
}