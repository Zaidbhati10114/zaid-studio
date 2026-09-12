import { callAIWithFallback } from "@/lib/validation/ai-providers";
import { fetchWebsiteHtml } from "./website-fetcher";
import { extractWebsiteEvidence } from "./html-extractor";
import { detectRenderer } from "./renderer-detector";
import { buildSalesStrategyPrompt } from "./sales-strategy-prompt";
import {
    getInspection,
    saveInspection,
} from "./inspection-repository";

export interface BusinessInspectionInput {
    id: string;

    name: string;
    primaryType: string | null;

    city: string;
    address: string;

    rating: number | null;
    reviewCount: number | null;

    website: string | null;
    phone: string | null;
}

export interface FastInspectionResult {
    score: number;
    priority: "high" | "medium" | "low";
    reasons: string[];
}

export interface DeepInspectionResult extends FastInspectionResult {
    websiteFindings: string[];
    outreachAngle: string;

    leadScore: number;
    businessInsight: string;
    painPoint: string;

    bestApproach: string;
    servicesToPitch: string[];
    bestContactMethod: string;
    openingLine: string;

    objectionPrediction: string;
    closingAngle: string;
}

export function fastInspect(
    business: Omit<BusinessInspectionInput, "id">,
): FastInspectionResult {
    let score = 0;
    const reasons: string[] = [];

    if (!business.website) {
        score += 40;
        reasons.push("No website found.");
    }

    if (!business.phone) {
        score += 10;
        reasons.push("Phone number missing.");
    }

    if ((business.reviewCount ?? 0) > 500) {
        score += 25;
        reasons.push("Large customer base.");
    }

    if ((business.rating ?? 5) < 4.2) {
        score += 15;
        reasons.push("Lower public rating.");
    }

    if (
        business.primaryType &&
        ["restaurant", "cafe", "bakery", "beauty_salon", "gym"].includes(
            business.primaryType,
        )
    ) {
        score += 10;
        reasons.push(`${business.primaryType} is a strong outreach niche.`);
    }

    score = Math.min(score, 100);

    return {
        score,
        priority:
            score >= 70 ? "high" : score >= 40 ? "medium" : "low",
        reasons,
    };
}

export async function deepInspect(
    business: BusinessInspectionInput,
    options?: {
        refresh?: boolean;
    },
): Promise<DeepInspectionResult> {
    const refresh = options?.refresh ?? false;

    // -------------------------
    // Cached inspection
    // -------------------------

    if (!refresh) {
        const cached = await getInspection(business.id);

        if (cached) {
            return {
                score: cached.fast_score,
                priority: cached.priority,
                reasons: [],

                websiteFindings: cached.website_findings ?? [],
                outreachAngle: cached.outreach_angle ?? "",

                leadScore: cached.lead_score ?? cached.fast_score,
                businessInsight: cached.business_insight ?? "",
                painPoint: cached.pain_point ?? "",

                bestApproach: cached.best_approach ?? "",
                servicesToPitch: cached.services_to_pitch ?? [],
                bestContactMethod: cached.best_contact_method ?? "",
                openingLine: cached.opening_line ?? "",

                objectionPrediction:
                    cached.objection_prediction ?? "",
                closingAngle: cached.closing_angle ?? "",
            };
        }
    }

    const fast = fastInspect(business);

    // -------------------------
    // No website fallback
    // -------------------------

    if (!business.website) {
        const leadScore = Math.min(
            fast.score + (business.reviewCount ?? 0) > 500 ? 15 : 0,
            100,
        );

        const result: DeepInspectionResult = {
            ...fast,

            leadScore,

            businessInsight:
                business.reviewCount && business.reviewCount > 500
                    ? `${business.name} already has strong customer demand with ${business.reviewCount} Google reviews.`
                    : `${business.name} has an opportunity to improve its online presence.`,

            painPoint:
                "Customers rely on Google and phone calls because there's no direct website experience.",

            websiteFindings: [
                "No website detected.",
                business.phone ? "Phone number available." : "Phone number missing.",
            ],

            outreachAngle:
                "Position a simple digital presence as a way to convert existing customer interest into more enquiries and bookings.",

            bestApproach:
                "Lead with helping customers view the menu, contact the business, and make bookings without extra friction.",

            servicesToPitch: [
                "Business Website",
                "Digital Menu Website",
                "WhatsApp Ordering Setup",
            ],

            bestContactMethod: business.phone ? "Phone" : "Instagram",

            openingLine: `I noticed ${business.name} is already getting discovered online, but customers still have to rely on calls for basic information—there's a simple way to make that much easier.`,

            objectionPrediction:
                "We already get customers from Google.",

            closingAngle:
                "Position this as improving conversions from people already finding the business, not replacing what's already working.",
        };

        await saveInspection({
            businessId: business.id,
            renderer: "none",
            fastScore: result.score,
            priority: result.priority,
            websiteEvidence: null,
            websiteFindings: result.websiteFindings,
            outreachAngle: result.outreachAngle,

            leadScore: result.leadScore,
            businessInsight: result.businessInsight,
            painPoint: result.painPoint,

            bestApproach: result.bestApproach,
            servicesToPitch: result.servicesToPitch,
            bestContactMethod: result.bestContactMethod,
            openingLine: result.openingLine,

            objectionPrediction: result.objectionPrediction,
            closingAngle: result.closingAngle,
        });

        return result;
    }

    // -------------------------
    // Website inspection
    // -------------------------

    const html = await fetchWebsiteHtml(business.website);
    const renderer = detectRenderer(html);
    const evidence = extractWebsiteEvidence(html);

    const prompt = buildSalesStrategyPrompt({
        name: business.name,
        category: business.primaryType,
        city: business.city,
        address: business.address,
        rating: business.rating,
        reviewCount: business.reviewCount,
        phone: business.phone,
        website: business.website,
        renderer,
        evidence,
    });

    const ai = await callAIWithFallback<{
        leadScore: number;
        businessInsight: string;
        painPoint: string;

        websiteFindings: string[];
        outreachAngle: string;

        bestApproach: string;
        servicesToPitch: string[];
        bestContactMethod: string;
        openingLine: string;

        objectionPrediction: string;
        closingAngle: string;
    }>(prompt, {
        task: "lead_inspection",
    });

    const bestContactMethod =
        evidence.hasWhatsApp
            ? "WhatsApp"
            : business.phone
                ? "Phone"
                : evidence.hasContactPage
                    ? "Website"
                    : evidence.hasInstagram
                        ? "Instagram DM"
                        : evidence.hasFacebook
                            ? "Facebook"
                            : "Unknown";

    const result: DeepInspectionResult = {
        ...fast,

        leadScore: ai.leadScore,
        businessInsight: ai.businessInsight,
        painPoint: ai.painPoint,

        websiteFindings: ai.websiteFindings,
        outreachAngle: ai.outreachAngle,

        bestApproach: ai.bestApproach,
        servicesToPitch: ai.servicesToPitch.slice(0, 3),
        bestContactMethod: bestContactMethod,
        openingLine: ai.openingLine,

        objectionPrediction: ai.objectionPrediction,
        closingAngle: ai.closingAngle,
    };

    await saveInspection({
        businessId: business.id,
        renderer,
        fastScore: result.score,
        priority: result.priority,
        websiteEvidence: evidence,
        websiteFindings: result.websiteFindings,
        outreachAngle: result.outreachAngle,

        leadScore: result.leadScore,
        businessInsight: result.businessInsight,
        painPoint: result.painPoint,

        bestApproach: result.bestApproach,
        servicesToPitch: result.servicesToPitch,
        bestContactMethod: result.bestContactMethod,
        openingLine: result.openingLine,

        objectionPrediction: result.objectionPrediction,
        closingAngle: result.closingAngle,
    });

    return result;
}