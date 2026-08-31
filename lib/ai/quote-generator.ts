
import { callAIWithFallback } from "../ai-providers";
import { QuoteRequestBody } from "../types";
import { buildQuotePrompt } from "./quote-prompt";

import type { GeneratedQuote } from "@/hooks/useQuote";

export async function generateQuote(
    body: QuoteRequestBody
): Promise<GeneratedQuote> {
    const prompt = buildQuotePrompt(body);
    return callAIWithFallback<GeneratedQuote>(prompt);
}