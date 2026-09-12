import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

function isAuthed(request: NextRequest) {
    return (
        request.cookies.get("admin_session")?.value ===
        process.env.ADMIN_PASSWORD
    );
}

/* GET /api/admin/lead-lab
   Returns all campaigns for the Lead Lab index page.
*/
export async function GET(request: NextRequest) {
    if (!isAuthed(request)) {
        return json({ error: "Unauthorized" }, 401);
    }

    const { data, error } = await supabaseAdmin
        .from("lead_campaigns")
        .select(`
      id,
      name,
      city,
      niche,
      status,
      created_at
    `)
        .order("created_at", { ascending: false });

    if (error) {
        return json({ error: error.message }, 500);
    }

    return json({
        success: true,
        campaigns: data ?? [],
    });
}

/* POST /api/admin/lead-lab
   Creates a new campaign.
*/
export async function POST(request: NextRequest) {
    if (!isAuthed(request)) {
        return json({ error: "Unauthorized" }, 401);
    }

    const body = await request.json();

    const estimatedRequests = 1 + body.maxResults;

    const { data, error } = await supabaseAdmin
        .from("lead_campaigns")
        .insert({
            name: body.name,
            city: body.city,
            niche: body.niche,
            radius_km: body.radius,
            max_results: body.maxResults,
            estimated_requests: estimatedRequests,
            status: "draft",
        })
        .select()
        .single();

    if (error) {
        return json({ error: error.message }, 500);
    }

    return json({
        success: true,
        campaign: data,
    });
}