// app/api/admin/showrooms/route.ts
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

// ─── Auth check ───────────────────────────────────────────────────────────────

function isAuthed(request: NextRequest): boolean {
    const cookie = request.cookies.get("admin_session");
    return cookie?.value === process.env.ADMIN_PASSWORD;
}

// ─── GET — list all showrooms ─────────────────────────────────────────────────

export async function GET(request: NextRequest) {
    if (!isAuthed(request)) return json({ error: "Unauthorized" }, 401);

    const { data, error } = await supabaseAdmin
        .from("client_showrooms")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return json({ error: error.message }, 500);
    return json({ showrooms: data });
}

// ─── POST — create showroom ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    if (!isAuthed(request)) return json({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const { client_name, business_name, message, designs } = body;

    if (!client_name || !business_name || !designs?.length) {
        return json({ error: "Missing required fields" }, 400);
    }

    // Generate slug: lowercase name + random 6-char suffix
    const base = client_name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const suffix = Math.random().toString(36).slice(2, 8);
    const slug = `${base}-${suffix}`;

    const { data, error } = await supabaseAdmin
        .from("client_showrooms")
        .insert({ slug, client_name, business_name, message, designs })
        .select("id, slug")
        .single();

    if (error) return json({ error: error.message }, 500);
    return json({ success: true, slug: data.slug, id: data.id });
}

// ─── DELETE — delete showroom ─────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
    if (!isAuthed(request)) return json({ error: "Unauthorized" }, 401);

    const { id } = await request.json();
    if (!id) return json({ error: "Missing id" }, 400);

    const { error } = await supabaseAdmin
        .from("client_showrooms")
        .delete()
        .eq("id", id);

    if (error) return json({ error: error.message }, 500);
    return json({ success: true });
}