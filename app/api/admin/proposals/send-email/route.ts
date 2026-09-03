import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { createProposalReviewEmailTemplate } from "@/lib/proposals/email/proposal-review-email-template";
import { sendProposalEmail } from "@/lib/services/email/send-proposal";

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

export async function POST(request: NextRequest) {
    if (!isAuthed(request)) {
        return json({ error: "Unauthorized" }, 401);
    }

    const { type, quoteId, versionNumber } = await request.json();

    if (!type || !quoteId) {
        return json({ error: "type and quoteId are required." }, 400);
    }

    try {
        // Quote is always the root
        const { data: quote, error: quoteError } = await supabaseAdmin
            .from("quotes")
            .select("id,name,email,project_type")
            .eq("id", quoteId)
            .single();

        if (quoteError || !quote) {
            return json({ error: "Quote not found." }, 404);
        }

        let slug: string | null = null;
        let timeline = "To be confirmed";
        let cost = "To be confirmed";

        // -----------------------------------------
        // Quote
        // -----------------------------------------

        if (type === "quote") {
            const { data } = await supabaseAdmin
                .from("quotes")
                .select("slug,sent")
                .eq("id", quoteId)
                .single();

            if (!data?.slug) {
                return json(
                    { error: "Generate a public link first." },
                    400
                );
            }

            slug = data.slug;
        }

        // -----------------------------------------
        // Draft
        // -----------------------------------------

        if (type === "draft") {
            const { data } = await supabaseAdmin
                .from("proposal_drafts")
                .select(
                    "id,slug,sent,estimated_timeline,estimated_cost"
                )
                .eq("quote_id", quoteId)
                .single();

            if (!data?.slug) {
                return json(
                    { error: "Generate a public link first." },
                    400
                );
            }

            slug = data.slug;
            timeline = data.estimated_timeline ?? timeline;
            cost = data.estimated_cost ?? cost;
        }

        // -----------------------------------------
        // Version
        // -----------------------------------------

        if (type === "version") {
            if (versionNumber == null) {
                return json(
                    { error: "versionNumber is required." },
                    400
                );
            }

            const { data } = await supabaseAdmin
                .from("proposal_versions")
                .select(
                    "id,slug,sent,estimated_timeline,estimated_cost"
                )
                .eq("quote_id", quoteId)
                .eq("version_number", versionNumber)
                .single();

            if (!data?.slug) {
                return json(
                    { error: "Generate a public link first." },
                    400
                );
            }

            slug = data.slug;
            timeline = data.estimated_timeline ?? timeline;
            cost = data.estimated_cost ?? cost;
        }

        const proposalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/proposal/${slug}`;

        const html = createProposalReviewEmailTemplate({
            clientName: quote.name,
            projectType: quote.project_type,
            proposalUrl,
            estimatedTimeline: timeline,
            estimatedCost: cost,
        });

        await sendProposalEmail({
            to: quote.email,
            subject: `Your Project Proposal is Ready — ${quote.project_type ?? "Project"}`,
            html,
        });

        const now = new Date().toISOString();

        if (type === "quote") {
            await supabaseAdmin
                .from("quotes")
                .update({
                    sent: true,
                })
                .eq("id", quoteId);
        }

        if (type === "draft") {
            await supabaseAdmin
                .from("proposal_drafts")
                .update({
                    sent: true,
                })
                .eq("quote_id", quoteId);
        }

        if (type === "version") {
            await supabaseAdmin
                .from("proposal_versions")
                .update({
                    sent: true,
                    sent_at: now,
                })
                .eq("quote_id", quoteId)
                .eq("version_number", versionNumber);
        }

        return json({
            success: true,
            proposalUrl,
        });
    } catch (error) {
        console.error({
            tag: "SEND_PROPOSAL_EMAIL_ERROR",
            quoteId,
            type,
            error,
        });

        return json(
            { error: "Internal server error." },
            500
        );
    }
}