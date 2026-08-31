// app/api/client/send-otp/route.ts
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import nodemailer from "nodemailer";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

// ── TODO: replace with your existing transporter config from send-proposal/route.ts ──
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

export async function POST(request: NextRequest) {
    const { email } = await request.json();

    if (!email?.trim()) {
        return json({ error: "Email is required" }, 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check the client actually has a workspace
    const { data: workspace } = await supabaseAdmin
        .from("client_workspaces")
        .select("client_name")
        .eq("client_email", normalizedEmail)
        .single();

    if (!workspace) {
        // Same message regardless of reason — don't leak which emails exist
        return json(
            { error: "We couldn't find a workspace for this email. Double check or contact us." },
            404,
        );
    }

    // 2. Rate limit — don't allow more than 1 OTP request per 60 seconds per email
    const { data: recentOtp } = await supabaseAdmin
        .from("client_otps")
        .select("created_at")
        .eq("client_email", normalizedEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (recentOtp) {
        const secondsSince = (Date.now() - new Date(recentOtp.created_at).getTime()) / 1000;
        if (secondsSince < 60) {
            return json(
                { error: `Please wait ${Math.ceil(60 - secondsSince)}s before requesting another code.` },
                429,
            );
        }
    }

    // 3. Generate and store OTP
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    const { error: insertError } = await supabaseAdmin
        .from("client_otps")
        .insert({ client_email: normalizedEmail, code, expires_at: expiresAt.toISOString() });

    if (insertError) {
        console.error("[send-otp] DB insert failed:", insertError);
        return json({ error: "Something went wrong. Please try again." }, 500);
    }

    // 4. Send email via Nodemailer
    try {
        await transporter.sendMail({
            from: `"Zaid Studio" <${process.env.GMAIL_USER}>`,
            to: normalizedEmail,
            subject: "Your verification code",
            html: `
        <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
          <p style="font-size: 14px; color: #555;">Hi ${workspace.client_name},</p>
          <p style="font-size: 14px; color: #555;">Here's your verification code to access your project workspace:</p>
          <p style="font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #2563eb; margin: 24px 0;">${code}</p>
          <p style="font-size: 12px; color: #999;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
        });
    } catch (err) {
        console.error("[send-otp] Email send failed:", err);
        return json({ error: "Failed to send code. Please try again." }, 500);
    }

    return json({ success: true });
}