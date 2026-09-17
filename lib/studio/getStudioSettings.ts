import { supabaseAdmin } from "@/lib/supabase-server";

export async function getStudioSettings() {
    const { data, error } = await supabaseAdmin
        .from("studio_settings")
        .select("*")
        .eq("id", true)
        .single();

    if (error) throw error;

    return data;
}