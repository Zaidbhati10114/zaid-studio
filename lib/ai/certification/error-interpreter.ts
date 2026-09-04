import { AIProviderError } from "@/lib/validation/ai-providers";


export interface CertificationErrorInfo {
    category: "provider" | "application";
    title: string;
    description: string;
    fix: string;
    retryable: boolean;
    deployBlocked: boolean;
}

export function interpretCertificationError(
    error: unknown
): CertificationErrorInfo {
    if (!(error instanceof AIProviderError)) {
        return {
            category: "application",
            title: "Unexpected application error",
            description: "The certification pipeline encountered an unexpected failure.",
            fix: "Check the server logs.",
            retryable: false,
            deployBlocked: true,
        };
    }

    switch (error.type) {
        case "authentication_error":
            return {
                category: "application",
                title: "Authentication failed",
                description: `${error.provider.toUpperCase()} credentials are invalid.`,
                fix: "Verify API keys.",
                retryable: false,
                deployBlocked: true,
            };

        case "invalid_request":
            return {
                category: "application",
                title: "Invalid request",
                description: `${error.provider.toUpperCase()} rejected the request.`,
                fix: "Update the benchmark prompt or request parameters.",
                retryable: false,
                deployBlocked: true,
            };

        case "invalid_json":
            return {
                category: "provider",
                title: "Invalid JSON",
                description: "The model returned malformed JSON.",
                fix: "Adjust the prompt or choose another model.",
                retryable: true,
                deployBlocked: true,
            };

        case "empty_response":
            return {
                category: "provider",
                title: "Empty response",
                description: "The provider returned no content.",
                fix: "Retry the test.",
                retryable: true,
                deployBlocked: true,
            };

        case "timeout":
            return {
                category: "provider",
                title: "Request timed out",
                description: "The provider exceeded the timeout.",
                fix: "Retry or choose another model.",
                retryable: true,
                deployBlocked: true,
            };

        case "rate_limit":
            return {
                category: "provider",
                title: "Rate limit reached",
                description: "The provider temporarily rejected the request.",
                fix: "Wait and retry.",
                retryable: true,
                deployBlocked: true,
            };

        case "provider_unavailable":
            return {
                category: "provider",
                title: "Provider unavailable",
                description: "The provider is temporarily unavailable.",
                fix: "Retry later.",
                retryable: true,
                deployBlocked: true,
            };

        default:
            return {
                category: "provider",
                title: "Provider error",
                description: error.message,
                fix: "Check provider logs.",
                retryable: false,
                deployBlocked: true,
            };
    }
}