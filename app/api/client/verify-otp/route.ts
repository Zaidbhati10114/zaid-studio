// app/api/client/verify-otp/route.ts
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import crypto from "crypto";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
    const { email, code } = await request.json();

    if (!email?.trim() || !code?.trim()) {
        return json({ error: "Email and code are required" }, 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Get the most recent OTP for this email
    const { data: otpRow, error: fetchError } = await supabaseAdmin
        .from("client_otps")
        .select("*")
        .eq("client_email", normalizedEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (fetchError || !otpRow) {
        return json({ error: "No code found. Please request a new one." }, 400);
    }

    // 2. Check expiry
    if (new Date(otpRow.expires_at) < new Date()) {
        return json({ error: "This code has expired. Please request a new one." }, 400);
    }

    // 3. Check attempt limit (brute force protection)
    if (otpRow.attempts >= MAX_ATTEMPTS) {
        return json({ error: "Too many attempts. Please request a new code." }, 429);
    }

    // 4. Check code match
    if (otpRow.code !== code.trim()) {
        await supabaseAdmin
            .from("client_otps")
            .update({ attempts: otpRow.attempts + 1 })
            .eq("id", otpRow.id);

        return json({ error: "Incorrect code. Please try again." }, 400);
    }

    // 5. Success — get the workspace, create session token
    const { data: workspace } = await supabaseAdmin
        .from("client_workspaces")
        .select("id, client_name, business_name")
        .eq("client_email", normalizedEmail)
        .single();

    if (!workspace) {
        return json({ error: "Workspace not found." }, 404);
    }

    // Delete used OTP so it can't be reused
    await supabaseAdmin.from("client_otps").delete().eq("id", otpRow.id);

    // 6. Create a session token — signed, stored as httpOnly cookie
    const sessionToken = crypto
        .createHmac("sha256", process.env.CLIENT_SESSION_SECRET!)
        .update(`${workspace.id}:${normalizedEmail}`)
        .digest("hex");

    const response = json({
        success: true,
        workspace: {
            id: workspace.id,
            client_name: workspace.client_name,
            business_name: workspace.business_name,
        },
    });

    response.headers.set(
        "Set-Cookie",
        `client_session=${workspace.id}.${sessionToken}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax; ${process.env.NODE_ENV === "production" ? "Secure;" : ""
        }`,
    );

    return response;
}