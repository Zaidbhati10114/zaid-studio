"use client";

import { CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";

import { useCampaign } from "./CampaignProvider";

export default function ImportConsole() {
  const { logs } = useCampaign();

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3 text-sm font-medium text-foreground">
        Import Runway
      </div>

      <div className="h-[320px] overflow-y-auto p-4 font-mono text-sm">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">Waiting for an import...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="mb-2 flex items-start gap-2">
              {log.type === "success" && (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
              )}

              {log.type === "info" && (
                <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-blue-500" />
              )}

              {log.type === "warning" && (
                <RefreshCw className="mt-0.5 h-4 w-4 text-yellow-500" />
              )}

              {log.type === "error" && (
                <XCircle className="mt-0.5 h-4 w-4 text-red-500" />
              )}

              <span className="text-foreground">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
