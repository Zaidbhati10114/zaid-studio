"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LiveBuildConsole, type LogEntry } from "./LiveBuildConsole";
import { DeploymentReport } from "./DeploymentReport";
import { useRouter } from "next/navigation";
import HistoryTimeline from "./HistoryTimeline";

export default function CertificationForm() {
  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState("");
  const router = useRouter();

  const [running, setRunning] = useState(false);

  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [completed, setCompleted] = useState(false);

  async function runCertification() {
    if (!model.trim()) {
      toast.error("Enter a model name.");
      return;
    }

    setRunning(true);
    setCompleted(false);
    setLogs([]);

    let hasError = false;

    const res = await fetch("/api/admin/model-lab/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider,
        model,
      }),
    });

    if (!res.body) {
      toast.error("Unable to start certification.");
      setRunning(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let id = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value);

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        if (!event.startsWith("data: ")) continue;

        const payload = JSON.parse(event.slice(6));

        if (payload.type === "error") {
          hasError = true;
        }

        setLogs((prev) => [
          ...prev,
          {
            id: id++,
            ...payload,
          },
        ]);
      }
    }

    setRunning(false);
    setCompleted(!hasError);

    if (hasError) {
      toast.error("Certification failed.");
    } else {
      toast.success("Certification completed.");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <h2 className="text-xl font-semibold">Run New Certification</h2>

            <p className="text-sm text-muted-foreground">
              Test a provider/model combination before deployment.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Provider</Label>

              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="groq">Groq</SelectItem>

                  <SelectItem value="gemini">Gemini</SelectItem>

                  <SelectItem value="sarvam">Sarvam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Model Name</Label>

              <Input
                placeholder="gemini-2.6-pro"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    runCertification();
                  }
                }}
              />
            </div>
          </div>

          <Button
            onClick={runCertification}
            disabled={running}
            className="w-full md:w-auto"
          >
            {running ? "Running Certification..." : "Run Certification"}
          </Button>
        </CardContent>
      </Card>

      <LiveBuildConsole logs={logs} running={running} />

      {completed && (
        <DeploymentReport
          provider={provider}
          model={model}
          task="quote_generation"
          onDeployed={() => {
            router.refresh();
          }}
        />
      )}
      <HistoryTimeline />
    </div>
  );
}
