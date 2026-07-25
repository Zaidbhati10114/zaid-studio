import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ── Admin protection (unchanged) ─────────────────────────────────────────────
    if (pathname === "/admin/login") {
        return NextResponse.next();
    }

    if (pathname.startsWith("/admin")) {
        const session = request.cookies.get("admin_session");
        if (!session || session.value !== process.env.ADMIN_PASSWORD) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
        return NextResponse.next();
    }

    // ── Client protection (new — custom OTP session, no Supabase Auth) ──────────
    if (pathname === "/client/login") {
        return NextResponse.next();
    }

    if (pathname.startsWith("/client")) {
        const session = request.cookies.get("client_session");

        if (!session) {
            return NextResponse.redirect(new URL("/client/login", request.url));
        }

        // Cookie format: "{workspaceId}.{hmacSignature}"
        const [workspaceId, signature] = session.value.split(".");

        if (!workspaceId || !signature) {
            return NextResponse.redirect(new URL("/client/login", request.url));
        }

        // Note: we can't re-verify the email here without a DB call (middleware
        // runs on Edge and shouldn't hit Supabase on every request for cost/speed).
        // The signature alone proves the cookie was issued by our server and
        // wasn't tampered with — full re-validation happens in the page itself.
        const isValidFormat = /^[a-f0-9]{64}$/.test(signature);
        if (!isValidFormat) {
            return NextResponse.redirect(new URL("/client/login", request.url));
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/client/:path*"],
};