import { Agent } from "undici";

const insecureAgent = new Agent({
    connect: {
        rejectUnauthorized: false,
    },
});

async function attempt(url: string, insecure = false) {
    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (compatible; LeadLabBot/1.0)",
            },
            redirect: "follow",
            signal: controller.signal,
            ...(insecure ? { dispatcher: insecureAgent } : {}),
        });

        if (!response.ok) {
            throw new Error(`Website returned ${response.status}.`);
        }

        const contentType =
            response.headers.get("content-type") ?? "";

        if (!contentType.includes("text/html")) {
            throw new Error("Website did not return HTML.");
        }

        return await response.text();
    } finally {
        clearTimeout(timeout);
    }
}

export async function fetchWebsiteHtml(url: string) {
    const candidates = [url];

    const parsed = new URL(url);

    if (!parsed.hostname.startsWith("www.")) {
        const withWww = new URL(url);
        withWww.hostname = `www.${parsed.hostname}`;
        candidates.push(withWww.toString());
    }

    let lastError: unknown;

    for (const candidate of candidates) {
        try {
            return await attempt(candidate);
        } catch (error) {
            lastError = error;

            if (process.env.NODE_ENV === "development") {
                try {
                    return await attempt(candidate, true);
                } catch (retryError) {
                    lastError = retryError;
                }
            }
        }
    }

    throw lastError;
}