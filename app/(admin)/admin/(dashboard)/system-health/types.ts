export type TimeRange =
    | "24h"
    | "7d"
    | "30d"
    | "all";

export interface DashboardData {
    success: boolean;
    range: TimeRange;



    overview: {
        status:
        | "healthy"
        | "degraded"
        | "unavailable";

        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;

        successRate: number;

        averageLatency: number | null;
        p95Latency: number | null;

        totalClientRequests: number;
        successfulClientRequests: number;
        failedClientRequests: number;

        fallbackRequests: number;
        fallbackRate: number;
        primaryAttemptSuccessRate: number;

        rateLimitErrors: number;
        timeoutErrors: number;
        invalidJsonErrors: number;
        providerErrors: number;
        authenticationErrors: number;
        invalidRequestErrors: number;
    };

    providers: Array<{
        provider: string;
        model: string;
        status:
        | "healthy"
        | "degraded"
        | "unavailable";

        lastSuccessAt: string | null;
        lastFailureAt: string | null;
        lastLatencyMs: number | null;

        consecutiveFailures: number;

        rateLimitCount: number;
        timeoutCount: number;
        invalidJsonCount: number;
        providerErrorCount: number;

        cooldownUntil: string | null;
        updatedAt: string;
    }>;

    providerUsage: Array<{
        provider: string;
        requests: number;
        usagePercent: number;
        successful: number;
        failed: number;
        successRate: number;
        averageLatency: number | null;
        p95Latency: number | null;
        rateLimitErrors: number;
        timeoutErrors: number;
        invalidJsonErrors: number;
    }>;

    performance: {
        averageRunDuration: number | null;
        fastestRun: any;
        slowestRun: any;
        providerTrend: Array<{
            provider: string;
            healthScore: number | null;
            recentRequests: number;
        }>;
    };

    insights: Array<{
        id: string;
        type:
        | "good"
        | "warning"
        | "info";
        title: string;
        description: string;
    }>;

    fallbackPaths: Array<{
        path: string;
        count: number;
    }>;

    alerts: {
        count: number;
        items: Array<{
            provider: string;
            model: string;
            errorType: string | null;
            httpStatus: number | null;
            latencyMs: number;
            source: string;
            createdAt: string;
        }>;
    };

    runs: {
        latest: any;
        latestManual: any;
        latestScheduled: any;
        recent: any[];

        statistics: {
            total: number;
            completed: number;
            failed: number;
            fullyHealthy: number;
        };
    };

    generatedAt: string;
}