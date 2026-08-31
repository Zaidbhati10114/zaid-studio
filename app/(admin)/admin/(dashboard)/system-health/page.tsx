"use client";

import { useCallback, useEffect, useState } from "react";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PerformancePanel } from "./components/performance-panel";
// import { IncidentsPanel } from "./components/incidents-panel";
// import { FallbackPanel } from "./components/fallback-panel";
import { RunHistory } from "./components/run-history";
import { OverviewCards } from "./components/overview-card";
import { ProviderGrid } from "./components/provider-grid";
import { RunHealthButton } from "./components/run-health-button";
import type { DashboardData, TimeRange } from "./types";
import { InsightsPanel } from "./components/insights-panel";

export default function SystemHealthPage() {
  const [range, setRange] = useState("7d");

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<DashboardData | null>(null);

  const load = useCallback(
    async (showSpinner = false) => {
      try {
        if (showSpinner) {
          setLoading(true);
        }

        const response = await fetch(
          `/api/admin/system-health?range=${range}`,
          {
            cache: "no-store",
          },
        );

        const result = await response.json();
        setData(result);
      } finally {
        setLoading(false);
      }
    },
    [range],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>

          <p className="text-muted-foreground">
            Monitor provider reliability, fallback behavior and performance.
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="24h">24h</SelectItem>

              <SelectItem value="7d">7 days</SelectItem>

              <SelectItem value="30d">30 days</SelectItem>

              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={() => void load(true)}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {data && (
        <>
          <OverviewCards overview={data.overview} />

          <ProviderGrid
            providers={data.providers}
            usage={data.providerUsage}
            trends={data.performance.providerTrend}
          />

          <RunHealthButton
            latestManual={data.runs.latestManual}
            latestScheduled={data.runs.latestScheduled}
            onComplete={() => load(true)}
          />

          <PerformancePanel performance={data.performance} />
          <InsightsPanel insights={data.insights} />

          {/* <FallbackPanel fallbackPaths={data.fallbackPaths} />

          <IncidentsPanel alerts={data.alerts} /> */}

          <RunHistory
            runs={data.runs.recent}
            statistics={data.runs.statistics}
          />
        </>
      )}
    </div>
  );
}
