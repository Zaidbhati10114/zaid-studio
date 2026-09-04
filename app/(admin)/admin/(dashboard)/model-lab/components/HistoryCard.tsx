"use client";

import { CheckCircle2, Clock3, Rocket, XCircle, Gauge } from "lucide-react";

interface Props {
  item: any;
}

export default function HistoryCard({ item }: Props) {
  const passed = item.connectivity_passed && item.json_passed;

  const StatusIcon = item.deployed ? Rocket : passed ? CheckCircle2 : XCircle;
  const report =
    typeof item.report === "string" ? JSON.parse(item.report) : item.report;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm capitalize text-white">
            {item.deployed ? "Deployed" : passed ? "Passed" : "Failed"}
          </p>

          <div>
            <h3 className="font-semibold text-white">
              {item.provider} · {item.model}
            </h3>

            <p className="text-sm text-slate-400">
              {item.task.replace("_", " ")}
            </p>
          </div>
        </div>

        {item.deployed && (
          <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300">
            Live
          </span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-slate-800/50 p-3">
          <div className="mb-1 flex items-center gap-2 text-slate-400">
            <Clock3 className="h-4 w-4" />
            <span className="text-xs">Time</span>
          </div>

          <p className="text-sm text-white">
            {new Date(item.created_at).toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800/50 p-3">
          <div className="mb-1 flex items-center gap-2 text-slate-400">
            <Gauge className="h-4 w-4" />
            <span className="text-xs">Latency</span>
          </div>

          <p className="text-sm text-white">{item.latency_ms ?? "—"} ms</p>
        </div>

        <div className="rounded-lg bg-slate-800/50 p-3">
          <div className="mb-1 flex items-center gap-2 text-slate-400">
            <StatusIcon className="h-4 w-4" />
            <span className="text-xs">Status</span>
          </div>

          <p className="text-sm capitalize text-white">
            {item.deployed ? "Deployed" : item.status}
          </p>
        </div>
      </div>

      {!passed && report?.message && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <p className="mb-1 text-xs font-semibold text-red-300">
            Failure reason
          </p>

          <p className="text-sm text-slate-200">{report.message}</p>

          {report.fix && (
            <div className="mt-2 rounded border border-red-500/20 bg-black/20 p-2">
              <p className="mb-1 text-xs font-semibold text-red-300">
                Suggested fix
              </p>

              <p className="text-xs text-slate-300">{report.fix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
