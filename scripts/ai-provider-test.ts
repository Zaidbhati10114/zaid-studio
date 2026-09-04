
import { callAIWithFallback } from "@/lib/validation/ai-providers";
import dotenv from "dotenv";

dotenv.config({
    path: ".env.local",
});

const prompt = `
Return ONLY valid JSON.

Generate a project proposal using this information.

Client: Test Client
Project Type: Website
Stage: Starting from scratch
Budget: Under ₹50k
Timeline: 2–4 weeks

Description:
Build a modern responsive website for a small interior design
business with a portfolio, service sections, contact form,
and WhatsApp integration.

Return exactly these fields:

complexity
summary
servicesMatched
estimatedTimeline
estimatedCost
whyHireMe
deliverables
techStack
phases
clientResponsibilities
risks
vsNoCode
nextSteps
`;

async function main() {
    const total = 20;

    let success = 0;
    let failed = 0;

    const results: Array<{
        request: number;
        success: boolean;
        latencyMs: number;
        error?: string;
    }> = [];

    for (let i = 1; i <= total; i++) {
        const start = Date.now();

        try {
            await callAIWithFallback(prompt);

            const latencyMs = Date.now() - start;

            success++;

            results.push({
                request: i,
                success: true,
                latencyMs,
            });

            console.log(
                `✅ ${i}/${total} — ${latencyMs}ms`
            );
        } catch (error) {
            const latencyMs = Date.now() - start;

            failed++;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            results.push({
                request: i,
                success: false,
                latencyMs,
                error: message,
            });

            console.log(
                `❌ ${i}/${total} — ${latencyMs}ms — ${message}`
            );
        }
    }

    const latencies = results.map((r) => r.latencyMs);
    const sorted = [...latencies].sort((a, b) => a - b);

    const average =
        latencies.reduce((a, b) => a + b, 0) /
        latencies.length;

    const p50 =
        sorted[Math.floor(sorted.length * 0.5)];

    const p95 =
        sorted[Math.min(
            sorted.length - 1,
            Math.ceil(sorted.length * 0.95) - 1
        )];

    console.log("\n========== RESULTS ==========");
    console.log(`Total:   ${total}`);
    console.log(`Success: ${success}`);
    console.log(`Failed:  ${failed}`);
    console.log(
        `Success rate: ${((success / total) * 100).toFixed(2)}%`
    );
    console.log(`Average: ${Math.round(average)}ms`);
    console.log(`P50:     ${p50}ms`);
    console.log(`P95:     ${p95}ms`);
    console.log("=============================");
}

main().catch(console.error);