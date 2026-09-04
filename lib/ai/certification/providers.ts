import { testAIProvider } from "@/lib/validation/ai-providers";



export interface CertificationProvider {
    generate(prompt: string): Promise<string>;
}

export function getProvider(
    provider: "groq" | "gemini" | "sarvam",
    model: string,
): CertificationProvider {
    return {
        async generate(prompt: string) {
            const result = await testAIProvider(
                provider,
                prompt,
                model,
            );

            return result.text;
        },
    };
}