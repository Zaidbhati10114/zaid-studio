import {
    QUOTE_BENCHMARK,
    PROPOSAL_BENCHMARK,
} from "./benchmark";

import {
    validateProposal,
    validateQuote,
} from "./validators";

import type { CertificationProvider } from "./providers";

export interface CertificationResult {
    latency: number;
    quote: unknown;
    proposal: unknown;
}

function parseAIJson(text: string) {
    const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("Failed to parse AI JSON:");
        console.error(cleaned);

        throw error;
    }
}

export async function runCertification(
    provider: CertificationProvider,
    log: (
        type: "info" | "success" | "error",
        message: string
    ) => void,
): Promise<CertificationResult> {
    const started = Date.now();

    log("info", "Running Quote benchmark...");

    const quoteResult = await provider.generate(QUOTE_BENCHMARK.prompt);
    // Parse if it's JSON text.
    const quote =
        parseAIJson(quoteResult);

    console.log("QUOTE OUTPUT:", quote);
    console.log("VALIDATING:", quote.projectQuote);
    console.log("VALIDATION RESULT:", validateQuote(quote.projectQuote));

    if (!validateQuote(quote.projectQuote)) {
        throw new Error("Quote validation failed.");
    }

    console.log("QUOTE OUTPUT:");
    console.log(quote);

    log("success", "Quote benchmark passed.");

    log("info", "Running Proposal benchmark...");

    const proposalResult = await provider.generate(PROPOSAL_BENCHMARK.prompt);

    const proposal =
        parseAIJson(proposalResult);


    if (!validateProposal(proposal.proposal)) {
        throw new Error("Proposal validation failed.");
    }

    log("success", "Proposal benchmark passed.");

    log("info", "Validating structured output...");

    // V1 validators already passed above.
    log("success", "JSON validation passed.");

    const latency = Date.now() - started;

    log("info", "Measuring performance...");
    log("success", `Latency recorded: ${latency} ms`);

    return {
        latency,
        quote,
        proposal,
    };
}