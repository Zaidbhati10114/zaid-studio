import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        if (!password) {
            return Response.json({ error: "Password is required" }, { status: 400 });
        }

        if (password !== process.env.ADMIN_PASSWORD) {
            return Response.json({ error: "Invalid password" }, { status: 401 });
        }

        const response = Response.json({ success: true });
        response.headers.set(
            "Set-Cookie",
            `admin_session=${password}; Path=/; Max-Age=${60 * 60 * 24 * 7}; HttpOnly; SameSite=strict`
        );
        return response;
    } catch {
        return Response.json({ error: "Login failed" }, { status: 500 });
    }
}