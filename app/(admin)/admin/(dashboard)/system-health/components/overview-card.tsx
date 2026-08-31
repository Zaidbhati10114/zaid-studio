import { Activity, RefreshCw, ShieldCheck, Timer } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { DashboardData } from "../types";

function Metric({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;

  value: string | number;

  subtitle: string;

  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{title}</span>

          {icon}
        </div>

        <div className="mt-3 text-3xl font-bold">{value}</div>

        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export function OverviewCards({
  overview,
}: {
  overview: DashboardData["overview"];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric
        title="Client Success"
        value={`${overview.successRate}%`}
        subtitle={`${overview.successfulClientRequests}/${overview.totalClientRequests} requests`}
        icon={<ShieldCheck className="size-5" />}
      />

      <Metric
        title="Average Latency"
        value={`${Math.round(overview.averageLatency)}ms`}
        subtitle={`P95 ${Math.round(overview.p95Latency)}ms`}
        icon={<Timer className="size-5" />}
      />

      <Metric
        title="Fallback Rate"
        value={`${overview.fallbackRate}%`}
        subtitle={`${overview.fallbackRequests} recovered requests`}
        icon={<RefreshCw className="size-5" />}
      />

      <Metric
        title="Provider Errors"
        value={overview.providerErrors}
        subtitle={`${overview.timeoutErrors} timeouts · ${overview.rateLimitErrors} rate limits`}
        icon={<Activity className="size-5" />}
      />
    </div>
  );
}
