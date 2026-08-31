import { inngest } from "../client";

import {
    runProviderHealthCheck,
} from "@/lib/ai-health/health-check";

export const aiSystemHealthCheck =
    inngest.createFunction(
        {
            id: "ai-system-health-check",
            triggers: {
                cron: "TZ=Asia/Kolkata 0 3 */2 * *",
            },
        },
        async () => {
            return runProviderHealthCheck(
                "scheduled_health_check",
            );
        },
    );