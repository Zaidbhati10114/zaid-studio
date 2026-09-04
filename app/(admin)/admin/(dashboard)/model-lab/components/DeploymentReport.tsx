"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  provider: string;
  model: string;
  task: string;
  onDeployed: () => void;
}

export function DeploymentReport({ provider, model, task, onDeployed }: Props) {
  const [deploying, setDeploying] = useState(false);

  async function deploy() {
    setDeploying(true);

    try {
      const res = await fetch("/api/admin/model-lab/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          model,
          task,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Deployment failed.");
      }

      toast.success(`${provider} · ${model} is now live.`);

      onDeployed();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Deployment failed.",
      );
    } finally {
      setDeploying(false);
    }
  }

  return (
    <Card className="border-green-500/30 bg-green-500/5">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-500" />

          <div>
            <h3 className="font-semibold">Certification Complete</h3>

            <p className="text-sm text-muted-foreground">
              {provider} · {model}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Quote</p>

            <p className="font-medium text-green-600">Passed</p>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Proposal</p>

            <p className="font-medium text-green-600">Passed</p>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">JSON</p>

            <p className="font-medium text-green-600">Passed</p>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Performance</p>

            <p className="font-medium text-green-600">Recorded</p>
          </div>
        </div>

        <Button onClick={deploy} disabled={deploying} className="w-full">
          {deploying ? "Deploying..." : "Deploy Model"}
        </Button>
      </CardContent>
    </Card>
  );
}
