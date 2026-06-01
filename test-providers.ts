import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { SarvamAIClient } from "sarvamai";

// ─── Load env manually (ts-node doesn't auto-load .env) ──────────────────────
import { config } from "dotenv";
config({ path: ".env.local" });

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const sarvam = new SarvamAIClient({ apiSubscriptionKey: process.env.SARVAM_API_KEY! });

const TEST_PROMPT = `
You are a project consultant. Respond ONLY with valid JSON, no markdown.

{
  "complexity": "Simple",
  "summary": "A short summary",
  "estimatedTimeline": "1 week",
  "estimatedCost": "₹10,000",
  "whyHireMe": "I get things done",
  "deliverables": ["Landing page"],
  "techStack": ["Next.js"],
  "phases": [{ "name": "Build", "duration": "1 week" }],
  "clientResponsibilities": ["Provide content"],
  "risks": [{ "risk": "Scope creep", "mitigation": "Clear brief" }],
  "nextSteps": ["Discovery call"]
}

Generate a proposal for: simple landing page for a coffee shop.
`;

// ─── Test each provider ───────────────────────────────────────────────────────

async function testGemini(): Promise<void> {
    console.log("\n── Gemini ──────────────────────────────");
    const t0 = Date.now();
    try {
        const model = gemini.getGenerativeModel({
            model: "gemini-3-flash-preview",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7,
                maxOutputTokens: 1500,
            },
        });
        const result = await model.generateContent(TEST_PROMPT);
        const text = result.response.text();
        const parsed = JSON.parse(text);
        console.log(`✓ OK — ${Date.now() - t0}ms`);
        console.log(`  complexity: ${parsed.complexity}`);
        console.log(`  cost: ${parsed.estimatedCost}`);
        console.log(`  timeline: ${parsed.estimatedTimeline}`);
    } catch (err) {
        console.log(`✗ FAIL — ${Date.now() - t0}ms`);
        console.log(`  status: ${(err as any)?.status}`);
        console.log(`  message: ${err instanceof Error ? err.message.slice(0, 120) : String(err)}`);
    }
}

async function testGroq(): Promise<void> {
    console.log("\n── Groq ────────────────────────────────");
    const t0 = Date.now();
    try {
        const result = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: TEST_PROMPT }],
            temperature: 0.7,
            max_tokens: 1500,
            response_format: { type: "json_object" },
        });
        const text = result.choices[0]?.message?.content ?? "";
        const parsed = JSON.parse(text);
        console.log(`✓ OK — ${Date.now() - t0}ms`);
        console.log(`  complexity: ${parsed.complexity}`);
        console.log(`  cost: ${parsed.estimatedCost}`);
        console.log(`  timeline: ${parsed.estimatedTimeline}`);
    } catch (err) {
        console.log(`✗ FAIL — ${Date.now() - t0}ms`);
        console.log(`  status: ${(err as any)?.status}`);
        console.log(`  message: ${err instanceof Error ? err.message.slice(0, 120) : String(err)}`);
    }
}

async function testSarvam(): Promise<void> {
    console.log("\n── Sarvam ──────────────────────────────");
    const t0 = Date.now();
    try {
        const result = await sarvam.chat.completions({
            model: "sarvam-105b",
            messages: [{ role: "user", content: TEST_PROMPT }],
            temperature: 0.7,
            max_tokens: 1500,
        });
        const text = result.choices[0]?.message?.content ?? "";
        // Sarvam may wrap in markdown — strip it
        const cleaned = text.replace(/```json|```/g, "").trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (!match) throw new Error(`No JSON found. Raw: ${text.slice(0, 200)}`);
        const parsed = JSON.parse(match[0]);
        console.log(`✓ OK — ${Date.now() - t0}ms`);
        console.log(`  complexity: ${parsed.complexity}`);
        console.log(`  cost: ${parsed.estimatedCost}`);
        console.log(`  timeline: ${parsed.estimatedTimeline}`);
    } catch (err) {
        console.log(`✗ FAIL — ${Date.now() - t0}ms`);
        console.log(`  status: ${(err as any)?.status}`);
        console.log(`  message: ${err instanceof Error ? err.message.slice(0, 200) : String(err)}`);
    }
}

// ─── Run all three ────────────────────────────────────────────────────────────

async function main() {
    console.log("Testing all AI providers...");
    console.log("API keys loaded:", {
        gemini: !!process.env.GEMINI_API_KEY,
        groq: !!process.env.GROQ_API_KEY,
        sarvam: !!process.env.SARVAM_API_KEY,
    });

    await testGemini();
    await testGroq();
    await testSarvam();

    console.log("\n────────────────────────────────────────");
    console.log("Done.");
}

main();