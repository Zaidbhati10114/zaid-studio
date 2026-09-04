"use client";

import { CheckCircle2, Loader2, Terminal, XCircle } from "lucide-react";

export interface LogEntry {
  id: number;
  type: "info" | "success" | "error";
  message: string;
  provider?: string;
  category?: "provider" | "application";
  title?: string;
  fix?: string;
  retryable?: boolean;
  deployBlocked?: boolean;
}
interface Props {
  logs: LogEntry[];
  running: boolean;
}

export function LiveBuildConsole({ logs, running }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0B1220]">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <Terminal className="h-4 w-4" />
          <span className="font-medium">Certification Runway</span>
        </div>

        {running ? (
          <div className="flex items-center gap-2 text-blue-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Running
          </div>
        ) : (
          <div className="text-sm text-slate-400">Idle</div>
        )}
      </div>

      <div className="h-[340px] overflow-y-auto p-4 font-mono text-sm">
        {logs.length === 0 ? (
          <p className="text-slate-500">Waiting for a certification run...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="mb-2 flex items-start gap-2">
              {log.type === "success" && (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-400" />
              )}

              {log.type === "info" && (
                <Loader2 className="mt-0.5 h-4 w-4 text-blue-400" />
              )}

              {log.type !== "error" ? (
                <>
                  {log.type === "success" && (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-400" />
                  )}

                  {log.type === "info" && (
                    <Loader2 className="mt-0.5 h-4 w-4 text-blue-400" />
                  )}

                  <span className="text-slate-200">{log.message}</span>
                </>
              ) : (
                <div className="w-full rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <XCircle className="mt-0.5 h-4 w-4 text-red-400" />

                      <div>
                        <p className="font-semibold text-red-300">
                          {log.title ?? "Error"}
                        </p>

                        <p className="text-xs text-slate-400">
                          {log.provider?.toUpperCase()} • {log.category}
                        </p>
                      </div>
                    </div>

                    {log.retryable && (
                      <span className="rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-300">
                        Retry
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-200">{log.message}</p>

                  {log.fix && (
                    <div className="mt-3 rounded border border-red-500/20 bg-black/20 p-2">
                      <p className="mb-1 text-xs font-semibold text-red-300">
                        Suggested fix
                      </p>
                      <p className="text-xs text-slate-300">{log.fix}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
