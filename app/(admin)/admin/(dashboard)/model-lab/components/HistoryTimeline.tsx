"use client";

import { useEffect, useState } from "react";
import HistoryCard from "./HistoryCard";

export default function HistoryTimeline() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/admin/model-lab/history");
        const data = await res.json();

        if (!cancelled) {
          setHistory(data.history ?? []);
        }
      } catch (error) {
        console.error("Failed to load certification history:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-slate-400">Loading certification history...</div>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Certification History
        </h2>

        <p className="text-sm text-slate-400">
          Every certification run is recorded here.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-slate-400">
          No certification history yet.
        </div>
      ) : (
        history.map((item) => <HistoryCard key={item.id} item={item} />)
      )}
    </section>
  );
}
