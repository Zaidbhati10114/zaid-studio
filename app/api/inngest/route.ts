import { serve } from "inngest/next";

import { inngest } from "@/lib/inngest/client";
import { aiSystemHealthCheck } from "@/lib/inngest/functions/ai-health-check";

export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        aiSystemHealthCheck,
    ],
});