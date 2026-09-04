"use client";

import { useEffect, useState, useCallback } from "react";
import { Bot, Rocket, Cpu } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CertificationForm from "./components/CertificationForm";

interface Deployment {
  id: string;
  provider: string;
  model: string;
  task: string;
  deployed_at: string;
}

export default function ModelLabPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDeployments = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/model-lab/deployments");

      const data = await res.json();

      setDeployments(data.deployments ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeployments();
  }, [loadDeployments]);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 pt-28 pb-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">AI Testing & Deployment</h1>

        <p className="text-muted-foreground">
          Certify new AI models before deploying them to production.
        </p>
      </div>

      {/* <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Rocket className="h-5 w-5" />
                Current Production
              </h2>

              <p className="text-sm text-muted-foreground">
                Active models currently powering your app.
              </p>
            </div>

            <Button disabled>Run Certification</Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {loading ? (
              <p>Loading deployments...</p>
            ) : (
              deployments.map((deployment) => (
                <Card key={deployment.id} className="border">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-600">LIVE</Badge>

                      <Cpu className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {deployment.task.replaceAll("_", " ")}
                      </h3>

                      <p className="text-sm text-muted-foreground capitalize">
                        {deployment.provider}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />

                        <span className="font-medium">{deployment.model}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Deployed{" "}
                      {new Date(deployment.deployed_at).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card> */}

      <CertificationForm />
    </main>
  );
}
