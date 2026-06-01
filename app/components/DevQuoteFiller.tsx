// components/DevQuoteFiller.tsx
"use client";

import { useEffect } from "react";
import type { QuoteFormData } from "@/hooks/useQuote";

const SCENARIOS: Record<string, QuoteFormData> = {
  simple: {
    name: "Zaid Test",
    email: "zaid@test.com",
    projectType: "Website",
    stage: "Starting from scratch",
    budget: "Under ₹50k",
    timeline: "ASAP",
    description:
      "A simple landing page for my gym equipment business with contact form and product showcase.",
  },
  complex: {
    name: "Zaid Test",
    email: "zaid@test.com",
    projectType: "SaaS Product",
    stage: "Need advanced features",
    budget: "₹3L+",
    timeline: "Flexible",
    description:
      "A full SaaS platform for restaurant management including inventory, staff scheduling, POS integration, and real-time analytics dashboard.",
  },
};

interface Props {
  onFill: (data: QuoteFormData) => void;
}

export default function DevQuoteFiller({ onFill }: Props) {
  const isDev = process.env.NODE_ENV === "development";

  // ← hooks always run, early return comes after
  useEffect(() => {
    if (!isDev) return;
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "f") onFill(SCENARIOS.simple);
      if (e.altKey && e.key === "c") onFill(SCENARIOS.complex);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isDev, onFill]);

  if (!isDev) return null; // ← early return after all hooks

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <p className="text-center text-[10px] font-mono text-yellow-500/60">
        alt+f / alt+c
      </p>
      {Object.entries(SCENARIOS).map(([label, data]) => (
        <button
          key={label}
          onClick={() => onFill(data)}
          className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs font-mono text-yellow-400 hover:bg-yellow-500/20"
        >
          ⚡ {label}
        </button>
      ))}
    </div>
  );
}
