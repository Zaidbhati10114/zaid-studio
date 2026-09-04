import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function isAuthed(request: NextRequest) {
    return (
        request.cookies.get("admin_session")?.value ===
        process.env.ADMIN_PASSWORD
    );
}

export async function GET(request: NextRequest) {
    if (!isAuthed(request)) {
        return json({ error: "Unauthorized" }, 401);
    }

    const { data, error } = await supabaseAdmin
        .from("ai_certification_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        return json({ error: error.message }, 500);
    }

    return json({
        history: data ?? [],
    });
}