import * as cheerio from "cheerio";

export interface WebsiteEvidence {
    title: string | null;
    metaDescription: string | null;
    h1: string | null;

    hasContactPage: boolean;
    hasBookingButton: boolean;
    hasOrderButton: boolean;

    hasInstagram: boolean;
    hasFacebook: boolean;
    hasWhatsApp: boolean;

    hasPhoneNumber: boolean;
    hasEmail: boolean;

    pageLength: number;
}

function getNextData(html: string) {
    const match = html.match(
        /<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/
    );

    if (!match) return "";

    return match[1];
}

export function extractWebsiteEvidence(
    html: string
): WebsiteEvidence {
    const $ = cheerio.load(html);

    const pageText = $("body").text().toLowerCase();
    const nextData = getNextData(html).toLowerCase();

    const hrefs = $("a")
        .map((_, el) => $(el).attr("href") ?? "")
        .get();

    const allText =
        pageText +
        " " +
        nextData +
        " " +
        hrefs.join(" ");

    return {
        title: $("title").first().text() || null,

        metaDescription:
            $('meta[name="description"]').attr("content") ?? null,

        h1: $("h1").first().text() || null,

        hasContactPage: hrefs.some((h) =>
            h.toLowerCase().includes("contact")
        ),

        hasBookingButton:
            pageText.includes("book now") ||
            pageText.includes("reserve") ||
            hrefs.some((h) =>
                h.toLowerCase().includes("reservation")
            ),

        hasOrderButton:
            pageText.includes("order now") ||
            pageText.includes("online order") ||
            hrefs.some((h) =>
                h.toLowerCase().includes("order")
            ),

        hasInstagram: allText.includes("instagram.com"),

        hasFacebook: allText.includes("facebook.com"),

        hasWhatsApp:
            allText.includes("wa.me") ||
            allText.includes("whatsapp"),

        hasPhoneNumber:
            /\+?\d[\d\s()-]{7,}/.test(allText),

        hasEmail:
            /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(
                allText
            ),

        pageLength: html.length,
    };
}