import { supabaseAdmin } from "../supabase-server";

export async function upsertHeartbeat(source: string) {
    const { error } = await supabaseAdmin
        .from("app_heartbeat")
        .upsert(
            {
                id: "project-hub",
                last_ping: new Date().toISOString(),
                source,
            },
            {
                onConflict: "id",
            }
        );

    if (error) {
        throw error;
    }
}