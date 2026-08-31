import { TrendingUp, Timer, Rocket, Turtle, Server } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { DashboardData } from "../types";

type Props = {
  performance: DashboardData["performance"];
};

function formatDuration(ms: number | null) {
  if (ms === null) return "—";

  if (ms < 1000) {
    return `${ms}ms`;
  }

  return `${(ms / 1000).toFixed(1)}s`;
}

export function PerformancePanel({ performance }: Props) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Performance Trends</h2>

        <p className="text-sm text-muted-foreground">
          Built from existing production telemetry.
        </p>
      </div>

      {/* Top metrics */}

      <div className="grid gap-4 md:grid-cols-3">
        <MiniCard
          title="Average Run"
          value={formatDuration(performance.averageRunDuration)}
          icon={<Timer className="size-5" />}
        />

        <MiniCard
          title="Fastest Run"
          value={formatDuration(performance.fastestRun?.duration_ms ?? null)}
          icon={<Rocket className="size-5" />}
        />

        <MiniCard
          title="Slowest Run"
          value={formatDuration(performance.slowestRun?.duration_ms ?? null)}
          icon={<Turtle className="size-5" />}
        />
      </div>

      {/* Provider trend */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Provider Reliability
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {performance.providerTrend.map((provider) => (
            <div key={provider.provider} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 capitalize">
                  <Server className="size-4" />

                  {provider.provider}
                </div>

                <div className="text-sm font-medium">
                  {provider.healthScore ?? "—"}%
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${provider.healthScore ?? 0}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Health Score</span>

                <span>{provider.recentRequests} requests</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function MiniCard({
  title,
  value,
  icon,
}: {
  title: string;

  value: string;

  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{title}</span>

          {icon}
        </div>

        <div className="mt-3 text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
