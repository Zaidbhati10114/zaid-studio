// lib/ai-health/tracker.ts

import type { AIHealthEvent } from "./types";
import {
    saveAIHealthEvent,
    getAIProviderHealth,
    upsertAIProviderHealth,
} from "./repository";
import { calculateProviderHealth } from "./state";

/**
 * Track an AI provider health event.
 *
 * Flow:
 * 1. Save the historical event.
 * 2. Read current provider state.
 * 3. Calculate the new state.
 * 4. Persist the updated current state.
 *
 * Health tracking must never break AI generation.
 */
export async function trackAIHealth(
    event: AIHealthEvent,
): Promise<{
    eventSaved: boolean;
    healthUpdated: boolean;
}> {
    try {
        const eventSaved =
            await saveAIHealthEvent(event);

        const currentHealth =
            await getAIProviderHealth(
                event.provider,
                event.model,
            );

        const updatedHealth =
            calculateProviderHealth(
                currentHealth,
                event,
            );

        await upsertAIProviderHealth(
            updatedHealth,
        );

        console.log(
            JSON.stringify({
                tag: "AI_HEALTH_UPDATED",
                provider: event.provider,
                model: event.model,
                source: event.source,
                runId: event.runId,
                status: updatedHealth.status,
                consecutiveFailures:
                    updatedHealth.consecutiveFailures,
                eventSaved,
            }),
        );

        return {
            eventSaved,
            healthUpdated: true,
        };
    } catch (error) {
        console.error(
            JSON.stringify({
                tag:
                    "AI_HEALTH_TRACKER_ERROR",
                provider: event.provider,
                model: event.model,
                source: event.source,
                runId: event.runId,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            }),
        );

        return {
            eventSaved: false,
            healthUpdated: false,
        };
    }
}