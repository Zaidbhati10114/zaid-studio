"use client";

import { useMemo, useState } from "react";
import { useCampaign } from "./CampaignProvider";

export default function BusinessFilters() {
  const { businesses } = useCampaign();

  const [selected, setSelected] = useState<string | null>(null);

  const types = useMemo(
    () =>
      Array.from(
        new Set(businesses.map((b: any) => b.primary_type).filter(Boolean)),
      ),
    [businesses],
  );

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setSelected(null)}
        className={`rounded-full px-3 py-1 text-sm ${
          selected === null
            ? "bg-blue-600 text-white"
            : "border border-slate-700 text-slate-300"
        }`}
      >
        All
      </button>

      {types.map((type) => (
        <button
          key={type}
          onClick={() => setSelected(type)}
          className={`rounded-full px-3 py-1 text-sm capitalize ${
            selected === type
              ? "bg-blue-600 text-white"
              : "border border-slate-700 text-slate-300"
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
