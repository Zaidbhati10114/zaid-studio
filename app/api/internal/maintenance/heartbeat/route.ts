import { NextRequest, NextResponse } from "next/server";

import { heartbeatService } from "@/lib/services/heartbeat";

export async function POST(req: NextRequest) {
    const auth = req.headers.get("authorization");

    if (
        auth !== `Bearer ${process.env.INTERNAL_API_SECRET}`
    ) {
        return NextResponse.json(
            {
                error: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }

    await heartbeatService();

    return NextResponse.json({
        success: true,
    });
}