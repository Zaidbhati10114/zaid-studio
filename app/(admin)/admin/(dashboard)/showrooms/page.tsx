"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Loader2,
  ExternalLink,
  Trash2,
  Copy,
  CheckCircle2,
  Presentation,
  Calendar,
  Monitor,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  created_at: string;
}

export default function ShowroomsPage() {
  const router = useRouter();
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  async function fetchShowrooms() {
    setLoading(true);
    const res = await fetch("/api/admin/showrooms");
    const data = await res.json();
    setShowrooms(data.showrooms ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const res = await fetch("/api/admin/showrooms");
      const data = await res.json();
      if (!cancelled) {
        setShowrooms(data.showrooms ?? []);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setDeletingId(id);
    await fetch("/api/admin/showrooms", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setShowrooms((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  async function handleCopy(slug: string) {
    const url = `${window.location.origin}/p/${slug}/designs`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Showrooms</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Personalised design pitches for each client
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/showrooms/new")}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="size-3.5" />
          New Showroom
        </button>
      </motion.div>

      {/* Empty state */}
      {showrooms.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/50 text-center"
        >
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border/50 bg-card/20">
            <Presentation className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No showrooms yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first personalised design pitch
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/showrooms/new")}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="size-3.5" />
            New Showroom
          </button>
        </motion.div>
      )}

      {/* Showroom cards */}
      <div className="flex flex-col gap-4">
        {showrooms.map((showroom, i) => (
          <motion.div
            key={showroom.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="rounded-2xl border border-border/50 bg-card/20 p-4 sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Left — client info */}
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-sm font-semibold">
                  {showroom.client_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{showroom.client_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {showroom.business_name}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg border border-border/50 bg-secondary/30 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                      /p/{showroom.slug}/designs
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Monitor className="size-3" />
                      {showroom.designs.length} design
                      {showroom.designs.length !== 1 ? "s" : ""}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="size-3" />
                      {new Date(showroom.created_at).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right — actions */}
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  onClick={() => handleCopy(showroom.slug)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    copiedSlug === showroom.slug
                      ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-400"
                      : "border-border/60 hover:bg-secondary/50",
                  )}
                >
                  {copiedSlug === showroom.slug ? (
                    <CheckCircle2 className="size-3" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  {copiedSlug === showroom.slug ? "Copied!" : "Copy link"}
                </button>

                <button
                  onClick={() =>
                    window.open(`/p/${showroom.slug}/designs`, "_blank")
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary/50"
                >
                  <ExternalLink className="size-3" />
                  Preview
                </button>

                <button
                  onClick={() => handleDelete(showroom.id)}
                  disabled={deletingId === showroom.id}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    confirmDeleteId === showroom.id
                      ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "border-border/60 text-muted-foreground hover:border-red-500/20 hover:text-red-400",
                  )}
                >
                  {deletingId === showroom.id ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                  {confirmDeleteId === showroom.id ? "Confirm?" : "Delete"}
                </button>
                <button
                  onClick={() =>
                    router.push(`/admin/showrooms/${showroom.id}/edit`)
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary/50"
                >
                  <Pencil className="size-3" />
                  Edit
                </button>
              </div>
            </div>

            {/* Design thumbnails strip */}
            {showroom.designs.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {showroom.designs.map((design, di) => (
                  <div
                    key={di}
                    className="shrink-0 overflow-hidden rounded-lg border border-border/50"
                  >
                    {design.thumbnail ? (
                      <img
                        src={design.thumbnail}
                        alt={design.label}
                        className="h-14 w-24 object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-24 items-center justify-center bg-secondary/30">
                        <Monitor className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="border-t border-border/50 bg-background/50 px-2 py-1">
                      <p className="truncate text-[10px] text-muted-foreground">
                        {design.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
