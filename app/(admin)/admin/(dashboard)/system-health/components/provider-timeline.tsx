"use client";

import { CheckCircle2, XCircle, Zap, Turtle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Event = {
  id: string;
  provider: string;
  model: string;
  status: "success" | "failed";
  latency_ms: number;
  created_at: string;
};

type Props = {
  events: Event[];
  summary: {
    fastestProvider: Event | null;
    slowestProvider: Event | null;
    averageLatency: number | null;
  };
};
function getProviderBarClass(provider: string) {
  switch (provider.toLowerCase()) {
    case "groq":
      return "bg-violet-500";
    case "gemini":
      return "bg-blue-500";
    case "sarvam":
      return "bg-emerald-500";
    default:
      return "bg-primary";
  }
}

function getProviderIconClass(provider: string) {
  switch (provider.toLowerCase()) {
    case "groq":
      return "bg-violet-500/10 text-violet-500";
    case "gemini":
      return "bg-blue-500/10 text-blue-500";
    case "sarvam":
      return "bg-emerald-500/10 text-emerald-500";
    default:
      return "bg-primary/10 text-primary";
  }
}

export function ProviderTimeline({ events, summary }: Props) {
  const maxLatency = Math.max(...events.map((e) => e.latency_ms), 1);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Provider Timeline</h2>

          <p className="text-sm text-muted-foreground">
            Execution order and response time for every provider.
          </p>
        </div>

        <Badge variant="secondary">Avg {summary.averageLatency} ms</Badge>
      </div>

      {/* Fastest / Slowest */}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={`rounded-full p-3 ${getProviderIconClass(
                summary.fastestProvider?.provider ?? "",
              )}`}
            >
              <Zap className="size-5" />
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Fastest</div>

              <div className="font-semibold">
                {summary.fastestProvider?.provider}
              </div>

              <div className="text-sm">
                {summary.fastestProvider?.latency_ms} ms
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={`rounded-full p-3 ${getProviderIconClass(
                summary.slowestProvider?.provider ?? "",
              )}`}
            >
              <Turtle className="size-5" />
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Slowest</div>

              <div className="font-semibold">
                {summary.slowestProvider?.provider}
              </div>

              <div className="text-sm">
                {summary.slowestProvider?.latency_ms} ms
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}

      <div className="space-y-4">
        {events.map((event) => {
          const width = Math.max((event.latency_ms / maxLatency) * 100, 6);

          return (
            <Card key={event.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {event.status === "success" ? (
                      <CheckCircle2 className="size-5 text-green-500" />
                    ) : (
                      <XCircle className="size-5 text-red-500" />
                    )}

                    <div>
                      <div className="font-semibold capitalize">
                        {event.provider}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {event.model}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">{event.latency_ms} ms</div>

                    <div className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Waterfall bar */}

                <div className="space-y-2">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getProviderBarClass(
                        event.provider,
                      )}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 ms</span>

                    <span>{maxLatency} ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
