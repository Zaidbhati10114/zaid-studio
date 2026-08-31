"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ProviderTimeline } from "../../components/provider-timeline";
import { ExecutionTimeline } from "../../components/execution-timeline";
import { RunComparison } from "../../components/run-comparison";
import { IncidentSnapshot } from "../../components/incident-snapshot";

export default function RunDetailsPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const [runId, setRunId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (id: string) => {
    setLoading(true);

    const res = await fetch(`/api/admin/system-health/runs/${id}`, {
      credentials: "include",
      cache: "no-store",
    });

    const json = await res.json();

    setData(json);
    setLoading(false);
  }, []);

  useEffect(() => {
    params.then((p) => {
      setRunId(p.runId);
      load(p.runId);
    });
  }, [params, load]);

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading run...</div>;
  }

  if (!data?.success) {
    return (
      <div className="p-8 text-red-500">
        API Error: {data?.error ?? "Unknown error"}
      </div>
    );
  }

  if (!data.run) {
    return <div className="p-8 text-muted-foreground">Run not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back */}

      <Link
        href="/admin/system-health"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to System Health
      </Link>

      {/* Title */}

      <div>
        <h1 className="text-3xl font-bold">Health Check Run</h1>

        <p className="font-mono text-sm text-muted-foreground break-all">
          {runId}
        </p>
      </div>

      {/* Status */}

      <div className="flex flex-wrap gap-3">
        <Badge
          variant={data.run.status === "completed" ? "default" : "destructive"}
        >
          {data.run.status}
        </Badge>

        <Badge variant="secondary">
          {data.run.source.replaceAll("_", " ")}
        </Badge>
      </div>

      {/* Summary */}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="space-y-2 p-4">
            <Clock3 className="size-5" />

            <div className="text-xs text-muted-foreground">Duration</div>

            <div className="text-xl font-bold">
              {(data.run.duration_ms / 1000).toFixed(1)}s
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4">
            <Calendar className="size-5" />

            <div className="text-xs text-muted-foreground">Started</div>

            <div className="text-sm">
              {new Date(data.run.started_at).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4">
            <CheckCircle2 className="size-5" />

            <div className="text-xs text-muted-foreground">
              Providers Passed
            </div>

            <div className="text-xl font-bold">
              {data.run.providers_passed}/{data.run.providers_tested}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4">
            <XCircle className="size-5" />

            <div className="text-xs text-muted-foreground">
              Telemetry Errors
            </div>

            <div className="text-xl font-bold">{data.run.telemetry_errors}</div>
          </CardContent>
        </Card>
      </div>

      <RunComparison comparison={data.comparison} />

      {/* Provider Timeline */}

      <ProviderTimeline events={data.events} summary={data.summary} />
      <ExecutionTimeline
        startedAt={data.run.started_at}
        completedAt={data.run.completed_at}
        durationMs={data.run.duration_ms}
        events={data.events}
      />
      <IncidentSnapshot
        run={data.run}
        events={data.events}
        comparison={data.comparison}
      />
    </div>
  );
}
