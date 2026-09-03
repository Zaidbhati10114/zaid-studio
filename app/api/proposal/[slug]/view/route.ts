import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        const { data: proposal, error } = await supabaseAdmin
            .from("client_showrooms")
            .select("id, status, view_count, first_viewed_at")
            .eq("slug", slug)
            .single();

        if (error || !proposal) {
            return json({ error: "Proposal not found" }, 404);
        }

        const updates: Record<string, unknown> = {
            view_count: (proposal.view_count ?? 0) + 1,
            last_viewed_at: new Date().toISOString(),
        };

        // Only set first_viewed_at once
        if (!proposal.first_viewed_at) {
            updates.first_viewed_at = new Date().toISOString();
        }

        // First view changes Sent → Viewed
        if (proposal.status === "sent") {
            updates.status = "viewed";
        }

        await supabaseAdmin
            .from("client_showrooms")
            .update(updates)
            .eq("id", proposal.id);

        return json({
            success: true,
            firstView: !proposal.first_viewed_at,
            totalViews: updates.view_count,
        });
    } catch (error) {
        console.error({
            tag: "PROPOSAL_VIEW_TRACK_ERROR",
            slug,
            error,
        });

        return json({ error: "Internal server error" }, 500);
    }
}