import { supabaseAdmin } from "@/lib/supabase-server";
import {
    searchGooglePlaces,
    type BusinessDirectoryRecord,
} from "./google";

interface ImportOptions {
    campaignId: string;
    city: string;
    niche: string;
    maxResults: number;
}

export interface ImportReport {
    found: number;
    newBusinesses: number;
    updatedBusinesses: number;
    linkedBusinesses: number;
    skippedBusinesses: number;
}

export type ImportEvent =
    | { type: "new"; business: string }
    | { type: "updated"; business: string }
    | { type: "linked"; business: string }
    | { type: "skipped"; business: string };

async function saveBusiness(
    business: BusinessDirectoryRecord,
): Promise<{ id: string; isNew: boolean }> {
    const { data: existing } = await supabaseAdmin
        .from("business_directory")
        .select("id")
        .eq("place_id", business.placeId)
        .maybeSingle();

    const isNew = !existing;

    const { data, error } = await supabaseAdmin
        .from("business_directory")
        .upsert(
            {
                place_id: business.placeId,
                name: business.name,
                address: business.address,
                city: business.city,
                latitude: business.latitude,
                longitude: business.longitude,
                rating: business.rating,
                review_count: business.reviewCount,
                website: business.website,
                phone: business.phone,
                primary_type: business.primaryType,
                types: business.types,
                opening_hours: business.openingHours,
                last_synced_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            { onConflict: "place_id" },
        )
        .select("id")
        .single();

    if (error) throw error;

    return {
        id: data.id,
        isNew,
    };
}

async function attachCampaign(
    campaignId: string,
    businessId: string,
): Promise<"linked" | "already_exists"> {
    // Has this lead already been assigned to ANY campaign?
    const { data: existing, error: existingError } = await supabaseAdmin
        .from("campaign_leads")
        .select("id, campaign_id")
        .eq("business_id", businessId)
        .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
        return "already_exists";
    }

    const { error } = await supabaseAdmin
        .from("campaign_leads")
        .insert({
            campaign_id: campaignId,
            business_id: businessId,
        });

    if (error) throw error;

    return "linked";
}

export async function importCampaignBusinesses(
    options: ImportOptions,
    onEvent?: (event: ImportEvent) => void,
): Promise<ImportReport> {
    const businesses = await searchGooglePlaces({
        city: options.city,
        niche: options.niche,
        maxResults: options.maxResults,
    });

    let newBusinesses = 0;
    let updatedBusinesses = 0;
    let linkedBusinesses = 0;
    let skippedBusinesses = 0;

    for (const business of businesses) {
        const saved = await saveBusiness(business);

        if (saved.isNew) {
            newBusinesses++;
            onEvent?.({
                type: "new",
                business: business.name,
            });
        } else {
            updatedBusinesses++;
            onEvent?.({
                type: "updated",
                business: business.name,
            });
        }


        const result = await attachCampaign(options.campaignId, saved.id);

        if (result === "linked") {
            linkedBusinesses++;

            onEvent?.({
                type: "linked",
                business: business.name,
            });
        } else {
            skippedBusinesses++;

            onEvent?.({
                type: "skipped",
                business: business.name,
            });
        }


    }

    await supabaseAdmin
        .from("lead_campaigns")
        .update({
            imported_count: linkedBusinesses,
            estimated_requests: 1 + options.maxResults,
            status: "imported",
        })
        .eq("id", options.campaignId);

    return {
        found: businesses.length,
        newBusinesses,
        updatedBusinesses,
        linkedBusinesses,
        skippedBusinesses,
    };
}