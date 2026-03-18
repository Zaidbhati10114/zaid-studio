export async function POST() {
    const response = Response.json({ success: true });
    response.headers.set(
        "Set-Cookie",
        "admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=strict"
    );
    return response;
}