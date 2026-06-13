"use client";

import posthog from "posthog-js";

export const AnalyticsEvents = {
    PROPOSAL_STARTED: "proposal_started",
    PROPOSAL_GENERATED: "proposal_generated",
    PROPOSAL_GENERATION_FAILED: "proposal_generation_failed",
    PROPOSAL_VIEWED: "proposal_viewed",
    PROPOSAL_CTA_CLICKED: "proposal_cta_clicked",
    SAMPLE_PROPOSAL_VIEWED: "sample_proposal_viewed",
    HOMEPAGE_START_A_PROJECT_CLICKED: "homepage_start_a_project_clicked",
    GET_YOUR_PROPOSAL_IN_30_SEC_CLICKED: 'get_your_proposal_in_30_sec_clicked',
    BOOK_30_MIN_CALL: 'book_30_min_call',
    DISCUSS_YOUR_PROJECT_CLICKED: 'discuss_your_project_clicked',
} as const;

export function track(
    event: (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents],
    properties?: Record<string, unknown>
) {
    if (typeof window === "undefined") return;

    try {
        posthog.capture(event, properties);
    } catch (error) {
        console.error("PostHog capture failed:", error);
    }
}