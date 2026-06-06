"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  Image,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Design {
  label: string;
  url: string;
  thumbnail: string;
}

const DEFAULT_DESIGNS: Design[] = [
  { label: "Design 1", url: "", thumbnail: "" },
  { label: "Design 2", url: "", thumbnail: "" },
  { label: "Design 3", url: "", thumbnail: "" },
];

const DEFAULT_MESSAGE =
  "Hey, I put these designs together specifically for your business. Browse each one, toggle between desktop and mobile views, and let me know which direction feels right — we can refine from there.";

export default function NewShowroomPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [designs, setDesigns] = useState<Design[]>(DEFAULT_DESIGNS);
  const [submitting, setSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateDesign(index: number, field: keyof Design, value: string) {
    setDesigns((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    );
  }

  function addDesign() {
    if (designs.length >= 5) return;
    setDesigns((prev) => [
      ...prev,
      { label: `Design ${prev.length + 1}`, url: "", thumbnail: "" },
    ]);
  }

  function removeDesign(index: number) {
    if (designs.length <= 1) return;
    setDesigns((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!clientName.trim() || !businessName.trim()) {
      setError("Client name and business name are required.");
      return;
    }
    const validDesigns = designs.filter((d) => d.url.trim());
    if (validDesigns.length === 0) {
      setError("Add at least one design URL.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/showrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName.trim(),
          business_name: businessName.trim(),
          message: message.trim() || DEFAULT_MESSAGE,
          designs: validDesigns,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create showroom");
      setCreatedSlug(data.slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!createdSlug) return;
    const url = `${window.location.origin}/p/${createdSlug}/designs`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (createdSlug) {
    const showroomUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${createdSlug}/designs`;
    return (
      <div className="mx-auto max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/4 p-6 text-center"
        >
          <div className="mb-4 flex justify-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle2 className="size-6 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-lg font-semibold">Showroom created!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send this link to {clientName}
          </p>

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-3 py-2.5">
            <p className="flex-1 truncate text-left font-mono text-sm text-muted-foreground">
              {showroomUrl}
            </p>
            <button
              onClick={handleCopy}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                copied
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "border border-border/60 hover:bg-secondary/50",
              )}
            >
              {copied ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => window.open(showroomUrl, "_blank")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/50"
            >
              <ExternalLink className="size-3.5" />
              Preview
            </button>
            <button
              onClick={() => router.push("/admin/showrooms")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              View all showrooms
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <button
          onClick={() => router.push("/admin/showrooms")}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to Showrooms
        </button>
        <h1 className="text-xl font-semibold tracking-tight">New Showroom</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build a personalised design pitch for a client
        </p>
      </motion.div>

      <div className="flex flex-col gap-5">
        {/* Client details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 }}
          className="rounded-2xl border border-border/50 bg-card/20 p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <Type className="size-3.5 text-blue-500" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Client Details
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Client name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="h-10 rounded-xl border border-border/60 bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Business name</label>
              <input
                type="text"
                placeholder="e.g. Rahul's Cafe"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="h-10 rounded-xl border border-border/60 bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Personal message{" "}
                <span className="text-muted-foreground font-normal">
                  (shown at top of showroom)
                </span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none rounded-xl border border-border/60 bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>
        </motion.div>

        {/* Designs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="rounded-2xl border border-border/50 bg-card/20 p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="size-3.5 text-blue-500" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Designs
              </span>
            </div>
            {designs.length < 5 && (
              <button
                onClick={addDesign}
                className="inline-flex items-center gap-1 text-xs text-blue-500 transition-colors hover:text-blue-400"
              >
                <Plus className="size-3" />
                Add design
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {designs.map((design, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/40 bg-background/30 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Design {i + 1}
                  </span>
                  {designs.length > 1 && (
                    <button
                      onClick={() => removeDesign(i)}
                      className="text-muted-foreground transition-colors hover:text-red-400"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-muted-foreground">
                      Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Design 1 · Dark & bold"
                      value={design.label}
                      onChange={(e) => updateDesign(i, "label", e.target.value)}
                      className="h-9 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Link2 className="size-3" />
                      Deployed URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://your-design.vercel.app"
                      value={design.url}
                      onChange={(e) => updateDesign(i, "url", e.target.value)}
                      className="h-9 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Image className="size-3" />
                      Thumbnail URL{" "}
                      <span className="text-muted-foreground/60">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://your-screenshot.png"
                      value={design.thumbnail}
                      onChange={(e) =>
                        updateDesign(i, "thumbnail", e.target.value)
                      }
                      className="h-9 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <button
            onClick={() => router.push("/admin/showrooms")}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {submitting ? "Creating..." : "Create Showroom"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
