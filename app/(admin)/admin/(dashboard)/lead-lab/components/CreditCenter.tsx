"use client";

import { useEffect, useState } from "react";
import { getProviderConfig } from "@/lib/lead-search/provider-config";

interface CreditData {
  totalRequests: number;
  estimatedRemaining: number;
  campaigns: number;
  successRate: number;
  providers: Record<
    string,
    {
      requests: number;
      jobs: number;
    }
  >;
}

export default function CreditCenter() {
  const [data, setData] = useState<CreditData | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/lead-lab/credits", {
        cache: "no-store",
      });

      const json = await res.json();

      setData(json);
    }

    load();
  }, []);

  if (!data) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
        Loading credit analytics...
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Credit Center</h2>

        <p className="text-sm text-slate-400">Real API usage across Lead Lab</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat title="API Requests" value={data.totalRequests} />

        <Stat title="Free Remaining" value={data.estimatedRemaining} />

        <Stat title="Campaigns" value={data.campaigns} />

        <Stat title="Success Rate" value={`${data.successRate}%`} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-300">Provider Usage</h3>

        {Object.entries(data.providers).map(([provider, stats]) => (
          <div
            key={getProviderConfig(provider as any).name}
            className="space-y-1"
          >
            <div className="flex justify-between text-sm">
              <span className="capitalize text-white">
                {getProviderConfig(provider as any).name}
              </span>

              <span className="text-slate-400">{stats.requests} requests</span>
            </div>

            <div className="h-2 rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{
                  width: `${Math.min(
                    (stats.requests /
                      getProviderConfig(provider as any).monthlyFreeRequests) *
                      100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-400">{title}</p>

      <p className="mt-2 text-xl font-bold text-white">{value}</p>
    </div>
  );
}
