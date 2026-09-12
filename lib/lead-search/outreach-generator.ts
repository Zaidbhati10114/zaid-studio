import { callAIWithFallback } from "@/lib/validation/ai-providers";
import {
    buildOutreachPrompt,
    OutreachInput,
} from "./outreach-prompt";

export interface OutreachResult {
    email: {
        subject: string;
        body: string;
    };
    whatsapp: string;
    linkedin: string;
}

export async function generateOutreach(
    input: OutreachInput,
): Promise<OutreachResult> {
    const prompt = buildOutreachPrompt(input);

    return await callAIWithFallback<OutreachResult>(
        prompt,
        {
            task: "outreach_generation",
        },
    );
}