"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, ChevronRight, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { DashboardData } from "../types";

type Props = {
  runs: DashboardData["runs"]["recent"];
  statistics: DashboardData["runs"]["statistics"];
};

function formatDuration(ms: number | null) {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function RunHistory({ runs, statistics }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Run History</h2>

          <p className="text-sm text-muted-foreground">
            Every health check is stored with its own timeline.
          </p>
        </div>

        <Badge variant="secondary">{statistics.total} Runs</Badge>
      </div>

      {/* Summary */}

      <div className="grid gap-3 md:grid-cols-4">
        <MiniStat label="Total" value={statistics.total} />

        <MiniStat label="Completed" value={statistics.completed} />

        <MiniStat label="Failed" value={statistics.failed} />

        <MiniStat label="Fully Healthy" value={statistics.fullyHealthy} />
      </div>

      {/* Runs */}

      <div className="space-y-3">
        {runs.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No health-check runs yet.
            </CardContent>
          </Card>
        )}

        {runs.map((run) => (
          <Link
            key={run.run_id}
            href={`/admin/system-health/runs/${run.run_id}`}
            className="block"
          >
            <Card className="transition-all hover:border-primary/40 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    {/* Top row */}

                    <div className="flex items-center gap-3">
                      {run.status === "completed" ? (
                        <CheckCircle2 className="size-5 text-green-500" />
                      ) : (
                        <XCircle className="size-5 text-red-500" />
                      )}

                      <Badge
                        variant={
                          run.source === "manual_health_check"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {run.source === "manual_health_check"
                          ? "Manual"
                          : "Scheduled"}
                      </Badge>

                      <span className="font-medium capitalize">
                        {run.status}
                      </span>
                    </div>

                    {/* Run ID */}

                    <div className="font-mono text-xs text-muted-foreground break-all">
                      {run.run_id}
                    </div>

                    {/* Stats */}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock3 className="size-4" />
                        {formatDuration(run.duration_ms)}
                      </div>

                      <div>
                        {run.providers_passed}/{run.providers_tested} providers
                        passed
                      </div>

                      <div>{formatDate(run.started_at)}</div>
                    </div>
                  </div>

                  <ChevronRight className="size-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>

        <div className="mt-1 text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
