"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useCampaign } from "./CampaignProvider";

interface Props {
  campaignId: string;
  city: string;
  niche: string;
}

export default function ImportButton({ campaignId, city, niche }: Props) {
  const [running, setRunning] = useState(false);

  const { addLog, refresh, clearLogs } = useCampaign();

  async function startImport() {
    clearLogs();
    setRunning(true);

    try {
      const response = await fetch("/api/admin/lead-lab/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
          city,
          niche,
          maxResults: 20,
        }),
      });

      if (!response.body) {
        throw new Error("Import stream unavailable.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const messages = buffer.split("\n\n");
        buffer = messages.pop() ?? "";

        for (const message of messages) {
          if (!message.startsWith("data: ")) continue;

          const log = JSON.parse(message.slice(6));
          addLog(log);
        }
      }

      await refresh();
      toast.success("Import completed.");

      // Let the final success message be visible briefly.
      setTimeout(() => {
        clearLogs();
      }, 1000);
    } catch (error) {
      addLog({
        type: "error",
        message: error instanceof Error ? error.message : "Import failed.",
      });

      toast.error("Import failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <button
      onClick={startImport}
      disabled={running}
      className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {running && <Loader2 className="h-4 w-4 animate-spin" />}

      {running ? "Importing..." : "Import Leads"}
    </button>
  );
}
