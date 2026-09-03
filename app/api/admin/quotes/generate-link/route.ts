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

const ADJECTIVES = [
    "silent",
    "golden",
    "rapid",
    "bright",
    "crimson",
    "misty",
    "frozen",
    "wild",
    "royal",
    "lucky",
    "swift",
    "gentle",
    "clever",
    "cosmic",
    "velvet",
];

const NOUNS = [
    "ocean",
    "forest",
    "falcon",
    "harbor",
    "river",
    "comet",
    "summit",
    "meadow",
    "shadow",
    "ember",
    "cloud",
    "voyage",
    "bridge",
    "anchor",
    "horizon",
];

function createSlug() {
    const adjective =
        ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];

    const noun =
        NOUNS[Math.floor(Math.random() * NOUNS.length)];

    const number = Math.floor(1000 + Math.random() * 9000);

    return `${adjective}-${noun}-${number}`;
}

async function generateUniqueSlug(
    table: "quotes" | "proposal_drafts" | "proposal_versions"
) {
    let slug = createSlug();

    while (true) {
        const { data: existing } = await supabaseAdmin
            .from(table)
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

        if (!existing) return slug;

        slug = createSlug();
    }
}

export async function POST(request: NextRequest) {
    if (!isAuthed(request)) {
        return json({ error: "Unauthorized" }, 401);
    }

    const { type, quoteId, versionNumber } = await request.json();

    if (!type || !quoteId) {
        return json(
            { error: "type and quoteId are required." },
            400
        );
    }

    try {
        // Root validation
        const { data: quote } = await supabaseAdmin
            .from("quotes")
            .select("id,name,slug,sent")
            .eq("id", quoteId)
            .single();

        if (!quote) {
            return json({ error: "Quote not found." }, 404);
        }

        // =====================================================
        // QUOTE
        // =====================================================

        if (type === "quote") {
            if (quote.slug) {
                return json({
                    success: true,
                    type: "quote",
                    created: false,
                    slug: quote.slug,
                    url: `/proposal/${quote.slug}`,
                    sent: quote.sent ?? false,
                });
            }

            const slug = await generateUniqueSlug("quotes");

            const { error } = await supabaseAdmin
                .from("quotes")
                .update({ slug })
                .eq("id", quote.id);

            if (error) throw error;

            return json({
                success: true,
                type: "quote",
                created: true,
                slug,
                url: `/proposal/${slug}`,
                sent: false,
            });
        }

        // =====================================================
        // PROPOSAL DRAFT
        // =====================================================

        if (type === "draft") {
            const { data: draft } = await supabaseAdmin
                .from("proposal_drafts")
                .select("id,slug,sent")
                .eq("quote_id", quoteId)
                .maybeSingle();

            if (!draft) {
                return json(
                    { error: "No proposal draft exists for this quote." },
                    404
                );
            }

            if (draft.slug) {
                return json({
                    success: true,
                    type: "draft",
                    created: false,
                    slug: draft.slug,
                    url: `/proposal/${draft.slug}`,
                    sent: draft.sent ?? false,
                });
            }

            const slug = await generateUniqueSlug("proposal_drafts");

            const { error } = await supabaseAdmin
                .from("proposal_drafts")
                .update({ slug })
                .eq("id", draft.id);

            if (error) throw error;

            return json({
                success: true,
                type: "draft",
                created: true,
                slug,
                url: `/proposal/${slug}`,
                sent: false,
            });
        }

        // =====================================================
        // PROPOSAL VERSION
        // =====================================================

        if (type === "version") {
            if (versionNumber == null) {
                return json(
                    { error: "versionNumber is required." },
                    400
                );
            }

            const { data: version } = await supabaseAdmin
                .from("proposal_versions")
                .select("id,slug,sent,version_number")
                .eq("quote_id", quoteId)
                .eq("version_number", versionNumber)
                .maybeSingle();

            if (!version) {
                return json(
                    { error: "Proposal version not found." },
                    404
                );
            }

            if (version.slug) {
                return json({
                    success: true,
                    type: "version",
                    created: false,
                    version: version.version_number,
                    slug: version.slug,
                    url: `/proposal/${version.slug}`,
                    sent: version.sent ?? false,
                });
            }

            const slug = await generateUniqueSlug("proposal_versions");

            const { error } = await supabaseAdmin
                .from("proposal_versions")
                .update({ slug })
                .eq("id", version.id);

            if (error) throw error;

            return json({
                success: true,
                type: "version",
                created: true,
                version: version.version_number,
                slug,
                url: `/proposal/${slug}`,
                sent: false,
            });
        }

        return json({ error: "Invalid type." }, 400);
    } catch (error) {
        console.error({
            tag: "GENERATE_LINK_ERROR",
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