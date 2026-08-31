"use client";

import { CheckCircle2, Circle } from "lucide-react";

type Event = {
  id: string;
  provider: string;
  latency_ms: number;
  created_at: string;
};

type Props = {
  startedAt: string;
  completedAt: string | null;
  durationMs: number;
  events: Event[];
};

function providerColor(provider: string) {
  switch (provider.toLowerCase()) {
    case "groq":
      return "bg-violet-500 border-violet-500";
    case "gemini":
      return "bg-blue-500 border-blue-500";
    case "sarvam":
      return "bg-emerald-500 border-emerald-500";
    default:
      return "bg-primary border-primary";
  }
}

function elapsed(start: string, current: string) {
  const ms = new Date(current).getTime() - new Date(start).getTime();

  return `+${(ms / 1000).toFixed(1)}s`;
}

export function ExecutionTimeline({
  startedAt,
  completedAt,
  durationMs,
  events,
}: Props) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Execution Timeline</h2>

        <p className="text-sm text-muted-foreground">
          Exact order in which providers completed.
        </p>
      </div>

      <div className="rounded-xl border p-5">
        <div className="space-y-6">
          {/* Run Started */}

          <TimelineItem
            icon={<Circle className="size-4" />}
            title="Run started"
            time={new Date(startedAt).toLocaleTimeString()}
            description="Health check initiated"
            line
          />

          {/* Provider Events */}

          {events.map((event, index) => (
            <TimelineItem
              key={event.id}
              icon={
                <div
                  className={`size-4 rounded-full border-2 ${providerColor(
                    event.provider,
                  )}`}
                />
              }
              title={`${event.provider} completed`}
              time={new Date(event.created_at).toLocaleTimeString()}
              description={`${elapsed(
                startedAt,
                event.created_at,
              )} • ${event.latency_ms} ms`}
              line={index !== events.length - 1}
            />
          ))}

          {/* Run Completed */}

          {completedAt && (
            <TimelineItem
              icon={<CheckCircle2 className="size-4 text-green-500" />}
              title="Run completed"
              time={new Date(completedAt).toLocaleTimeString()}
              description={`Total duration ${(durationMs / 1000).toFixed(1)}s`}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  icon,
  title,
  time,
  description,
  line = false,
}: {
  icon: React.ReactNode;
  title: string;
  time: string;
  description: string;
  line?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex size-8 items-center justify-center">{icon}</div>

        {line && <div className="mt-2 h-full w-px bg-border" />}
      </div>

      <div className="flex-1 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-medium">{title}</div>

          <div className="text-sm text-muted-foreground">{time}</div>
        </div>

        <div className="mt-1 text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}
