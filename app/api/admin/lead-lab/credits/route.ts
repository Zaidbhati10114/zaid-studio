import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
    getProviderConfig,
} from "@/lib/lead-search/provider-config";

const GOOGLE_MONTHLY_FREE =
    getProviderConfig("google").monthlyFreeRequests;

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("lead_import_jobs")
        .select("provider,api_requests,status,created_at");

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    const successful = (data ?? []).filter(
        (job) => job.status === "success"
    );

    const totalRequests = successful.reduce(
        (sum, job) => sum + (job.api_requests ?? 0),
        0
    );

    const providerStats = successful.reduce<
        Record<string, { requests: number; jobs: number }>
    >((acc, job) => {
        const provider = job.provider;

        if (!acc[provider]) {
            acc[provider] = {
                requests: 0,
                jobs: 0,
            };
        }

        acc[provider].requests += job.api_requests ?? 0;
        acc[provider].jobs += 1;

        return acc;
    }, {});

    const successRate =
        data && data.length > 0
            ? Math.round((successful.length / data.length) * 100)
            : 100;

    return NextResponse.json({
        totalRequests,
        estimatedRemaining: Math.max(
            GOOGLE_MONTHLY_FREE - totalRequests,
            0
        ),
        campaigns: successful.length,
        successRate,
        providers: providerStats,
    });
}