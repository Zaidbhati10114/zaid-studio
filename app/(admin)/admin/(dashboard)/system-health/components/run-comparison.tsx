"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type Comparison = {
  previousRun: any;
  durationDelta: number;
  durationDeltaPercent: number;
  providers: {
    provider: string;
    currentLatency: number;
    previousLatency: number | null;
    deltaMs: number | null;
    deltaPercent: number | null;
  }[];
};

export function RunComparison({
  comparison,
}: {
  comparison: Comparison | null;
}) {
  if (!comparison) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No previous run available yet.
        </CardContent>
      </Card>
    );
  }

  const faster = comparison.durationDelta < 0;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Compared with Previous Run</h2>

        <p className="text-sm text-muted-foreground">
          Automatic performance comparison.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            {faster ? (
              <ArrowDown className="size-6 text-green-500" />
            ) : (
              <ArrowUp className="size-6 text-red-500" />
            )}

            <div>
              <div className="text-xl font-bold">
                {Math.abs(comparison.durationDelta / 1000).toFixed(1)}s{" "}
                {faster ? "faster" : "slower"}
              </div>

              <div className="text-sm text-muted-foreground">
                {Math.abs(comparison.durationDeltaPercent)}% compared to the
                previous run
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {comparison.providers.map((provider) => (
              <div
                key={provider.provider}
                className="flex items-center justify-between border-b pb-3 last:border-b-0"
              >
                <div className="font-medium capitalize">
                  {provider.provider}
                </div>

                <div className="flex items-center gap-2">
                  {provider.deltaMs === null ? (
                    <Minus className="size-4 text-muted-foreground" />
                  ) : provider.deltaMs < 0 ? (
                    <ArrowDown className="size-4 text-green-500" />
                  ) : (
                    <ArrowUp className="size-4 text-red-500" />
                  )}

                  <span className="font-medium">
                    {provider.deltaMs === null
                      ? "New"
                      : `${provider.deltaMs > 0 ? "+" : ""}${provider.deltaMs} ms`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
