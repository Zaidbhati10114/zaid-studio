import { Lightbulb, CheckCircle2, AlertTriangle, Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { DashboardData } from "../types";

export function InsightsPanel({
  insights,
}: {
  insights: DashboardData["insights"];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">AI Insights</h2>

        <p className="text-sm text-muted-foreground">
          Automatically generated observations from your system telemetry.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="size-5" />
            What stands out?
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                {insight.type === "good" && (
                  <CheckCircle2 className="mt-0.5 size-5 text-green-500" />
                )}

                {insight.type === "warning" && (
                  <AlertTriangle className="mt-0.5 size-5 text-orange-500" />
                )}

                {insight.type === "info" && (
                  <Info className="mt-0.5 size-5 text-blue-500" />
                )}

                <div>
                  <div className="font-medium">{insight.title}</div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    {insight.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
