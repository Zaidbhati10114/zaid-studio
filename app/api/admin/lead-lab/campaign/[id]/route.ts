import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id: campaignId } = await params;

    const [campaignResult, businessesResult, jobsResult] = await Promise.all([
        supabaseAdmin
            .from("lead_campaigns")
            .select("*")
            .eq("id", campaignId)
            .single(),

        supabaseAdmin
            .from("campaign_leads")
            .select(`
        id,
        status,
        ai_score,
        business_directory (
          *,
          business_inspections (*)
        ),
        lead_outreach!lead_outreach_campaign_lead_id_fkey (*)
      `)
            .eq("campaign_id", campaignId),

        supabaseAdmin
            .from("lead_import_jobs")
            .select("*")
            .eq("campaign_id", campaignId)
            .order("created_at", { ascending: false }),
    ]);

    if (campaignResult.error) {
        return NextResponse.json(
            {
                success: false,
                error: campaignResult.error.message,
                campaignId,
            },
            { status: 404 },
        );
    }

    const businesses =
        businessesResult.data
            ?.map((item: any) => {
                const directory = Array.isArray(item.business_directory)
                    ? item.business_directory[0]
                    : item.business_directory;

                if (!directory) return null;

                const inspection = Array.isArray(directory.business_inspections)
                    ? directory.business_inspections[0]
                    : directory.business_inspections;

                const outreach = Array.isArray(item.lead_outreach)
                    ? item.lead_outreach[0] ?? null
                    : item.lead_outreach;

                return {
                    // Restore all business fields
                    ...directory,

                    leadId: item.id,
                    status: item.status,
                    ai_score: item.ai_score,

                    outreach: outreach
                        ? {
                            email: {
                                subject: outreach.email_subject,
                                body: outreach.email_body,
                            },
                            whatsapp: outreach.whatsapp,
                            linkedin: outreach.linkedin,
                        }
                        : null,

                    inspection: inspection
                        ? {
                            score: inspection.fast_score,
                            priority: inspection.priority,

                            websiteFindings: inspection.website_findings ?? [],
                            outreachAngle: inspection.outreach_angle ?? "",

                            bestApproach: inspection.best_approach ?? "",
                            servicesToPitch: inspection.services_to_pitch ?? [],
                            bestContactMethod:
                                inspection.best_contact_method ?? "",
                            openingLine: inspection.opening_line ?? "",

                            evidence: inspection.website_evidence ?? {},
                            inspectedAt: inspection.inspected_at,
                        }
                        : null,
                };
            })
            .filter(Boolean) ?? [];

    return NextResponse.json({
        success: true,
        campaign: campaignResult.data,
        businesses,
        importJobs: jobsResult.data ?? [],
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: campaignId } = await params;

        // Get campaign lead IDs
        const { data: campaignLeads, error: leadsError } = await supabaseAdmin
            .from("campaign_leads")
            .select("id")
            .eq("campaign_id", campaignId);

        if (leadsError) throw leadsError;

        const leadIds = campaignLeads?.map((l) => l.id) ?? [];

        // Delete outreach linked to those campaign leads
        if (leadIds.length > 0) {
            const { error } = await supabaseAdmin
                .from("lead_outreach")
                .delete()
                .in("campaign_lead_id", leadIds);

            if (error) throw error;
        }

        // Delete campaign leads
        const { error: campaignLeadError } = await supabaseAdmin
            .from("campaign_leads")
            .delete()
            .eq("campaign_id", campaignId);

        if (campaignLeadError) throw campaignLeadError;

        // Delete import jobs
        const { error: jobsError } = await supabaseAdmin
            .from("lead_import_jobs")
            .delete()
            .eq("campaign_id", campaignId);

        if (jobsError) throw jobsError;

        // Delete campaign
        const { error: campaignError } = await supabaseAdmin
            .from("lead_campaigns")
            .delete()
            .eq("id", campaignId);

        if (campaignError) throw campaignError;

        return NextResponse.json({
            success: true,
            campaignId,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Delete failed.",
            },
            { status: 500 }
        );
    }
}