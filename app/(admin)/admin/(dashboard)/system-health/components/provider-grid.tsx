import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock3,
  BarChart3,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { DashboardData } from "../types";

type Props = {
  providers: DashboardData["providers"];
  usage: DashboardData["providerUsage"];
  trends: DashboardData["performance"]["providerTrend"];
};

function statusVariant(status: string) {
  switch (status) {
    case "healthy":
      return "default";

    case "degraded":
      return "secondary";

    case "unavailable":
      return "destructive";

    default:
      return "outline";
  }
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "healthy":
      return <CheckCircle2 className="size-4" />;

    case "degraded":
      return <AlertTriangle className="size-4" />;

    default:
      return <XCircle className="size-4" />;
  }
}

function formatLatency(value: number | null) {
  if (value === null) return "—";

  if (value < 1000) {
    return `${Math.round(value)}ms`;
  }

  return `${(value / 1000).toFixed(1)}s`;
}

function formatDate(value: string | null) {
  if (!value) return "Never";

  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ProviderGrid({ providers, usage, trends }: Props) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Provider Health</h2>

        <p className="text-sm text-muted-foreground">
          Live provider status with real production telemetry.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {providers.map((provider) => {
          const usageData = usage.find(
            (item) => item.provider === provider.provider,
          );

          const trendData = trends.find(
            (item) => item.provider === provider.provider,
          );

          return (
            <Card key={provider.provider}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">
                    {provider.provider}
                  </CardTitle>

                  <Badge
                    variant={statusVariant(provider.status) as any}
                    className="gap-1"
                  >
                    <StatusIcon status={provider.status} />

                    {provider.status}
                  </Badge>
                </div>

                <p className="truncate text-xs text-muted-foreground">
                  {provider.model}
                </p>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Health Score */}

                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Health Score
                    </span>

                    <Activity className="size-4" />
                  </div>

                  <div className="mt-2 text-3xl font-bold">
                    {trendData?.healthScore ?? "—"}%
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${trendData?.healthScore ?? 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Metrics */}

                <div className="grid grid-cols-2 gap-4">
                  <Metric
                    label="Last latency"
                    value={formatLatency(provider.lastLatencyMs)}
                    icon={<Clock3 className="size-4" />}
                  />

                  <Metric
                    label="Success"
                    value={`${Math.round(usageData?.successRate ?? 0)}%`}
                    icon={<CheckCircle2 className="size-4" />}
                  />

                  <Metric
                    label="Requests"
                    value={usageData?.requests ?? 0}
                    icon={<BarChart3 className="size-4" />}
                  />

                  <Metric
                    label="P95"
                    value={formatLatency(usageData?.p95Latency ?? null)}
                    icon={<Clock3 className="size-4" />}
                  />
                </div>

                {/* Error counters */}

                <div className="grid grid-cols-3 gap-2">
                  <SmallMetric label="429" value={provider.rateLimitCount} />

                  <SmallMetric label="Timeout" value={provider.timeoutCount} />

                  <SmallMetric label="JSON" value={provider.invalidJsonCount} />
                </div>

                {/* Footer */}

                <div className="border-t pt-3 text-xs text-muted-foreground">
                  Last success
                  <div className="mt-1 text-foreground">
                    {formatDate(provider.lastSuccessAt)}
                  </div>
                  {provider.consecutiveFailures > 0 && (
                    <div className="mt-2 font-medium text-orange-500">
                      {provider.consecutiveFailures} consecutive failure
                      {provider.consecutiveFailures > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>

        {icon}
      </div>

      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-2 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>

      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
