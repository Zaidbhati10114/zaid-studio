"use client";

import { useState } from "react";

import { RefreshCw, Zap, CheckCircle2, Clock3 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type RunInfo = {
  run_id: string;
  completed_at: string | null;
  duration_ms: number;
} | null;

type Props = {
  latestManual: RunInfo;
  latestScheduled: RunInfo;
  onComplete: () => Promise<void>;
};

function formatDate(value: string | null) {
  if (!value) return "Never";

  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDuration(ms: number | null | undefined) {
  if (!ms) return "—";

  if (ms < 1000) {
    return `${ms}ms`;
  }

  return `${(ms / 1000).toFixed(1)}s`;
}

export function RunHealthButton({
  latestManual,
  latestScheduled,
  onComplete,
}: Props) {
  const [running, setRunning] = useState(false);

  const [lastRunId, setLastRunId] = useState<string | null>(null);

  const runCheck = async () => {
    try {
      setRunning(true);

      const response = await fetch("/api/admin/system-health/check", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Health check failed");
      }

      setLastRunId(result.runId);

      await onComplete();
    } catch (error) {
      console.error(error);

      alert("Health check failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="size-5" />
          Run System Health Check
        </CardTitle>

        <CardDescription>
          Instantly test Groq, Gemini and Sarvam using the same health-check
          engine as the scheduled Inngest job.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4" />
              Last Manual Run
            </div>

            <div className="mt-2 font-medium">
              {formatDate(latestManual?.completed_at ?? null)}
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              Duration {formatDuration(latestManual?.duration_ms)}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="size-4" />
              Last Scheduled Run
            </div>

            <div className="mt-2 font-medium">
              {formatDate(latestScheduled?.completed_at ?? null)}
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              Duration {formatDuration(latestScheduled?.duration_ms)}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Trigger an immediate diagnostic.
            </p>

            <p className="text-xs text-muted-foreground">
              Results will automatically appear in Run History after completion.
            </p>
          </div>

          <Button
            onClick={runCheck}
            disabled={running}
            className="min-w-[190px]"
          >
            <RefreshCw
              className={`mr-2 size-4 ${running ? "animate-spin" : ""}`}
            />

            {running ? "Running..." : "Run Health Check"}
          </Button>
        </div>

        {lastRunId && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-3">
            <Badge variant="outline">Latest Run</Badge>

            <code className="text-xs">{lastRunId}</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
