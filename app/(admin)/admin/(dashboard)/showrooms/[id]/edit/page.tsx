"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Link2,
  Image,
  Type,
  Save,
} from "lucide-react";

interface Design {
  label: string;
  url: string;
  thumbnail: string;
}

interface Showroom {
  id: string;
  slug: string;
  client_name: string;
  business_name: string;
  message: string;
  designs: Design[];
}

export default function EditShowroomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [clientName, setClientName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [message, setMessage] = useState("");
  const [designs, setDesigns] = useState<Design[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState("");

  // ── Load existing showroom ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await fetch(`/api/admin/showrooms/${id}`);
      if (!res.ok) {
        if (!cancelled) setNotFound(true);
        return;
      }
      const data: Showroom = await res.json();
      if (!cancelled) {
        setClientName(data.client_name);
        setBusinessName(data.business_name);
        setMessage(data.message);
        setDesigns(
          Array.isArray(data.designs)
            ? data.designs
            : JSON.parse(data.designs as unknown as string),
        );
        setSlug(data.slug);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

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

  async function handleSave() {
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
      const res = await fetch(`/api/admin/showrooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName.trim(),
          business_name: businessName.trim(),
          message: message.trim(),
          designs: validDesigns,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update showroom");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading && !notFound) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium">Showroom not found</p>
        <button
          onClick={() => router.push("/admin/showrooms")}
          className="text-sm text-blue-500 hover:underline"
        >
          ← Back to Showrooms
        </button>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
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
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Edit Showroom
            </h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              /p/{slug}/designs
            </p>
          </div>
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 text-sm text-emerald-400"
            >
              <CheckCircle2 className="size-3.5" />
              Saved — client link still works
            </motion.div>
          )}
        </div>
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
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="h-10 rounded-xl border border-border/60 bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Business name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="h-10 rounded-xl border border-border/60 bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Personal message</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none rounded-xl border border-border/60 bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
                      className="h-9 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
                      className="h-9 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
                      className="h-9 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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

        {/* Actions */}
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
            onClick={handleSave}
            disabled={submitting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
