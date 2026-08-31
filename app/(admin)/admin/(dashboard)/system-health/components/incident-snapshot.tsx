"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Run = {
  run_id: string;
  status: string;
  duration_ms: number;
  providers_passed: number;
  providers_tested: number;
};

type Event = {
  provider: string;
  latency_ms: number;
  status: string;
};

type Comparison = {
  durationDelta: number;
  durationDeltaPercent: number;
  providers: {
    provider: string;
    deltaMs: number | null;
  }[];
} | null;

type Props = {
  run: Run;
  events: Event[];
  comparison: Comparison;
};

export function IncidentSnapshot({ run, events, comparison }: Props) {
  const [copied, setCopied] = useState(false);

  const snapshot = useMemo(() => {
    const overall =
      run.providers_passed === run.providers_tested ? "Healthy" : "Degraded";

    const providerLines = events
      .map((event) => {
        const delta = comparison?.providers.find(
          (p) => p.provider === event.provider,
        );

        const deltaText =
          delta?.deltaMs == null
            ? ""
            : delta.deltaMs > 0
              ? ` (+${delta.deltaMs}ms)`
              : ` (${delta.deltaMs}ms)`;

        return `• ${event.provider}: ${event.latency_ms}ms${deltaText}`;
      })
      .join("\n");

    const comparisonLine = comparison
      ? `• Run duration: ${(run.duration_ms / 1000).toFixed(1)}s (${Math.abs(
          comparison.durationDeltaPercent,
        )}% ${
          comparison.durationDelta < 0 ? "faster" : "slower"
        } than previous)`
      : `• Run duration: ${(run.duration_ms / 1000).toFixed(1)}s`;

    return `🩺 AI System Health Snapshot

Run: ${run.run_id.slice(0, 8)}...
Status: ${overall} (${run.providers_passed}/${run.providers_tested} providers)

${comparisonLine}

Providers:
${providerLines}`;
  }, [run, events, comparison]);

  async function copySnapshot() {
    await navigator.clipboard.writeText(snapshot);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Incident Snapshot</h2>
        <p className="text-sm text-muted-foreground">
          One-click summary for Slack, Discord, GitHub or email.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm">
            {snapshot}
          </pre>

          <div className="flex justify-end">
            <Button onClick={copySnapshot} className="gap-2">
              {copied ? (
                <>
                  <Check className="size-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  Copy Snapshot
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
