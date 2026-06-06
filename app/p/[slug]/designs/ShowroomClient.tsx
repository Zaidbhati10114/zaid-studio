"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Smartphone,
  ExternalLink,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Design {
  label: string;
  url: string;
  thumbnail: string;
}

interface Showroom {
  slug: string;
  client_name: string;
  business_name: string;
  message: string;
  designs: Design[];
}

interface Props {
  showroom: Showroom;
}

const CAL_LINK = "https://cal.com/zaidbhati07/30min";

export default function ShowroomClient({ showroom }: Props) {
  const designs: Design[] = Array.isArray(showroom.designs)
    ? showroom.designs
    : JSON.parse(showroom.designs as unknown as string);

  const [activeDesign, setActiveDesign] = useState(0);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const current = designs[activeDesign];
  const firstName = showroom.client_name.split(" ")[0];

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "d")
        setDevice((d) => (d === "desktop" ? "mobile" : "desktop"));
      const num = parseInt(e.key);
      if (num >= 1 && num <= designs.length) {
        setActiveDesign(num - 1);
        setIframeLoading(true);
        setIframeKey((k) => k + 1);
      }
    },
    [designs.length],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function switchDesign(idx: number) {
    if (idx === activeDesign) return;
    setActiveDesign(idx);
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
  }

  const calLink =
    `${CAL_LINK}` +
    `?name=${encodeURIComponent(showroom.client_name)}` +
    `&notes=${encodeURIComponent(
      `Interested in a design for ${showroom.business_name}. Liked: ${current?.label ?? "a design"} from /p/${showroom.slug}/designs`,
    )}`;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between border-b border-border/50 bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            zaid<span className="text-blue-500">studio</span>
            <span className="size-1.5 rounded-full bg-blue-500" />
          </div>
          <div className="hidden h-4 w-px bg-border/50 sm:block" />
          <p className="hidden text-sm text-muted-foreground sm:block">
            <span className="text-foreground font-medium">{firstName}</span>
            {" · "}
            {showroom.business_name}
          </p>
        </div>

        {/* Device toggle — top bar on desktop */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-lg border border-border/50 bg-secondary/20 p-1 sm:flex">
            <button
              onClick={() => setDevice("desktop")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                device === "desktop"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Monitor className="size-3.5" />
              Desktop
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                device === "mobile"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Smartphone className="size-3.5" />
              Mobile
            </button>
          </div>

          {current?.url && (
            <a
              href={current.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">Open full</span>
            </a>
          )}
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border/50 bg-card/10 lg:flex">
          {/* Client greeting */}
          <div className="border-b border-border/30 p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-blue-500 mb-1">
              Hey {firstName} 👋
            </p>
            <p className="text-sm font-medium leading-snug">
              {designs.length} design{designs.length !== 1 ? "s" : ""} for{" "}
              {showroom.business_name}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {showroom.message}
            </p>
          </div>

          {/* Design picker */}
          <div className="flex-1 overflow-y-auto p-3">
            <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Designs
            </p>
            <div className="flex flex-col gap-1">
              {designs.map((design, i) => (
                <button
                  key={i}
                  onClick={() => switchDesign(i)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all",
                    activeDesign === i
                      ? "border-blue-500/30 bg-blue-500/8 text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border/50 hover:bg-secondary/30 hover:text-foreground",
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative shrink-0 overflow-hidden rounded-lg border border-border/50">
                    {design.thumbnail ? (
                      <img
                        src={design.thumbnail}
                        alt={design.label}
                        className="h-10 w-14 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-14 items-center justify-center bg-secondary/40">
                        <Monitor className="size-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">
                      {design.label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Press {i + 1}
                    </p>
                  </div>

                  {activeDesign === i && (
                    <ChevronRight className="size-3.5 shrink-0 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CTA — always visible in sidebar */}
          <div className="border-t border-border/30 p-4">
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Like what you see? Let's talk about building this for{" "}
              {showroom.business_name}.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={calLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <CalendarDays className="size-3.5" />
                Book a call
              </a>
              {/* <Link
                href="/get-quote"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/50"
              >
                Get a quote
                <ArrowRight className="size-3.5" />
              </Link> */}
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {["No commitment", "Free discovery call"].map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                >
                  <CheckCircle2 className="size-3 shrink-0 text-emerald-500" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main preview area ──────────────────────────────────────────────── */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Browser chrome bar */}
          <div className="flex shrink-0 items-center gap-3 border-b border-border/30 bg-secondary/10 px-4 py-2">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-border/60" />
              <span className="size-2.5 rounded-full bg-border/60" />
              <span className="size-2.5 rounded-full bg-border/60" />
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-md border border-border/30 bg-background/50 px-3 py-1">
              <span className="truncate font-mono text-[11px] text-muted-foreground">
                {current?.url || "https://your-design.vercel.app"}
              </span>
            </div>
            {/* Mobile device toggle — visible only on small screens */}
            <div className="flex items-center gap-1 sm:hidden">
              <button
                onClick={() => setDevice("desktop")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  device === "desktop"
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-muted-foreground",
                )}
              >
                <Monitor className="size-3.5" />
              </button>
              <button
                onClick={() => setDevice("mobile")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  device === "mobile"
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-muted-foreground",
                )}
              >
                <Smartphone className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Iframe area */}
          <div
            className={cn(
              "relative flex min-h-0 flex-1 items-start justify-center overflow-auto bg-secondary/5",
              device === "mobile" ? "py-6" : "",
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeDesign}-${device}-${iframeKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "relative overflow-hidden transition-all duration-300",
                  device === "mobile"
                    ? "h-[700px] w-[390px] rounded-[40px] border-[6px] border-foreground/15 shadow-2xl shadow-black/20"
                    : "h-full w-full",
                )}
              >
                {current?.url ? (
                  <>
                    {/* Notch */}
                    {device === "mobile" && (
                      <div className="absolute left-1/2 top-2 z-20 flex -translate-x-1/2 items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
                        <div className="h-2.5 w-[72px] rounded-full bg-foreground/15" />
                      </div>
                    )}

                    {iframeLoading && (
                      <div className="absolute inset-0 z-10 bg-background p-6">
                        <div className="flex h-full flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="h-5 w-32 animate-pulse rounded-lg bg-secondary/60" />
                            <div className="flex gap-2">
                              <div className="h-5 w-16 animate-pulse rounded-lg bg-secondary/60" />
                              <div className="h-5 w-16 animate-pulse rounded-lg bg-secondary/60" />
                              <div className="h-5 w-16 animate-pulse rounded-lg bg-secondary/60" />
                            </div>
                          </div>
                          <div className="mt-4 flex flex-col gap-3">
                            <div className="h-8 w-2/3 animate-pulse rounded-xl bg-secondary/60" />
                            <div className="h-4 w-full animate-pulse rounded-lg bg-secondary/40" />
                            <div className="h-4 w-4/5 animate-pulse rounded-lg bg-secondary/40" />
                            <div className="mt-2 flex gap-2">
                              <div className="h-9 w-28 animate-pulse rounded-xl bg-secondary/60" />
                              <div className="h-9 w-24 animate-pulse rounded-xl bg-secondary/40" />
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-3">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="h-24 animate-pulse rounded-2xl bg-secondary/40"
                              />
                            ))}
                          </div>
                          <div className="mt-auto flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <div className="size-3.5 animate-spin rounded-full border border-blue-500 border-t-transparent" />
                            Loading {current?.label ?? "design"}...
                          </div>
                        </div>
                      </div>
                    )}

                    <iframe
                      key={`iframe-${activeDesign}-${iframeKey}`}
                      src={current.url}
                      className={cn(
                        "border-0 transition-opacity duration-300",
                        iframeLoading ? "opacity-0" : "opacity-100",
                        device === "mobile"
                          ? "h-full w-full pt-6 pb-4" // padding for notch + home bar
                          : "h-full w-full",
                      )}
                      onLoad={() => setIframeLoading(false)}
                      title={current.label}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />

                    {/* Home indicator */}
                    {device === "mobile" && (
                      <div className="absolute bottom-2 left-1/2 z-20 h-1 w-24 -translate-x-1/2 rounded-full bg-foreground/20" />
                    )}
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
                    <Monitor className="size-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      No URL added for this design
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Mobile bottom bar — design switcher + CTA ─────────────────── */}
          <div className="shrink-0 border-t border-border/50 bg-background/95 p-3 backdrop-blur lg:hidden">
            {/* Design switcher pills */}
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {designs.map((design, i) => (
                <button
                  key={i}
                  onClick={() => switchDesign(i)}
                  className={cn(
                    "shrink-0 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                    activeDesign === i
                      ? "border-blue-500/40 bg-blue-500/8 text-blue-400"
                      : "border-border/50 text-muted-foreground",
                  )}
                >
                  {design.thumbnail && (
                    <img
                      src={design.thumbnail}
                      alt=""
                      className="h-5 w-7 rounded object-cover"
                    />
                  )}
                  {design.label}
                </button>
              ))}
            </div>

            {/* CTA row */}
            <div className="flex gap-2">
              <a
                href={calLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <CalendarDays className="size-4" />
                Book a call
              </a>
              <Link
                href="/get-quote"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/50"
              >
                Quote
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
