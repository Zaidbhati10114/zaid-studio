import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === "/admin/login") {
        return NextResponse.next();
    }

    if (pathname.startsWith("/admin")) {
        const session = request.cookies.get("admin_session");
        if (!session || session.value !== process.env.ADMIN_PASSWORD) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};