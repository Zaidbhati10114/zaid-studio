import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function isAuthed(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return true;
  const cookie = request.cookies.get("admin_session");
  return cookie?.value === adminPassword;
}

export async function GET(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: quotes, error } = await supabaseAdmin
      .from("quotes")
      .select("id, name, email, project_type, summary, estimated_timeline, estimated_cost, created_at, status")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ proposals: [] });
    }

    return NextResponse.json({ proposals: quotes || [] });
  } catch (error) {
    console.error("Failed to load proposals list:", error);
    return NextResponse.json({ proposals: [] });
  }
}
