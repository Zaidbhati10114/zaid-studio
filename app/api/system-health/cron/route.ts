import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    try {
        const response = await fetch(
            `${request.nextUrl.origin}/api/admin/system-health/check`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.CRON_SECRET}`,
                },
                cache: "no-store",
            }
        );

        const data = await response.json();

        return NextResponse.json({
            success: response.ok,
            source: "scheduled_health_check",
            data,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Cron failed.",
            },
            { status: 500 }
        );
    }
}