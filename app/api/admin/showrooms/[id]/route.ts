// app/api/admin/showrooms/[id]/route.ts
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function isAuthed(request: NextRequest): boolean {
    const cookie = request.cookies.get("admin_session");
    return cookie?.value === process.env.ADMIN_PASSWORD;
}

// ─── GET — fetch single showroom ──────────────────────────────────────────────

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    if (!isAuthed(request)) return json({ error: "Unauthorized" }, 401);

    const { id } = await params;

    const { data, error } = await supabaseAdmin
        .from("client_showrooms")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) return json({ error: "Showroom not found" }, 404);
    return json(data);
}

// ─── PATCH — update showroom ──────────────────────────────────────────────────

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    if (!isAuthed(request)) return json({ error: "Unauthorized" }, 401);

    const { id } = await params;
    const body = await request.json();
    const { client_name, business_name, message, designs } = body;

    if (!client_name || !business_name || !designs?.length) {
        return json({ error: "Missing required fields" }, 400);
    }

    const { error } = await supabaseAdmin
        .from("client_showrooms")
        .update({ client_name, business_name, message, designs })
        .eq("id", id);

    if (error) return json({ error: error.message }, 500);
    return json({ success: true });
}