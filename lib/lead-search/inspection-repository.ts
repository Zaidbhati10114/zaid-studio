import { supabaseAdmin } from "@/lib/supabase-server";

export async function getInspection(businessId: string) {
    const { data, error } = await supabaseAdmin
        .from("business_inspections")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle();

    if (error) throw error;

    return data;
}

export async function saveInspection({
    businessId,
    renderer,
    fastScore,
    priority,
    websiteEvidence,
    websiteFindings,
    outreachAngle,

    bestApproach,
    servicesToPitch,
    bestContactMethod,
    openingLine,

    leadScore,
    businessInsight,
    painPoint,
    objectionPrediction,
    closingAngle,
}: {
    businessId: string;
    renderer: string;
    fastScore: number;
    priority: string;

    websiteEvidence: unknown;
    websiteFindings: string[];
    outreachAngle: string;

    bestApproach?: string | null;
    servicesToPitch?: string[];
    bestContactMethod?: string | null;
    openingLine?: string | null;

    leadScore?: number | null;
    businessInsight?: string | null;
    painPoint?: string | null;
    objectionPrediction?: string | null;
    closingAngle?: string | null;
}) {
    const { error } = await supabaseAdmin
        .from("business_inspections")
        .upsert(
            {
                business_id: businessId,
                renderer,
                fast_score: fastScore,
                priority,

                website_evidence: websiteEvidence,
                website_findings: websiteFindings,
                outreach_angle: outreachAngle,

                best_approach: bestApproach,
                services_to_pitch: servicesToPitch,
                best_contact_method: bestContactMethod,
                opening_line: openingLine,

                lead_score: leadScore,
                business_insight: businessInsight,
                pain_point: painPoint,
                objection_prediction: objectionPrediction,
                closing_angle: closingAngle,

                inspected_at: new Date().toISOString(),
            },
            {
                onConflict: "business_id",
            },
        );

    if (error) throw error;
}