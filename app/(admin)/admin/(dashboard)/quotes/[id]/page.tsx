"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase, type Quote } from "@/lib/supabase";
import {
  ArrowLeft,
  Clock,
  IndianRupee,
  Layers,
  Lightbulb,
  ListChecks,
  Sparkles,
  Loader2,
  Mail,
  Trash2,
  CheckCircle2,
  Calendar,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; classes: string }> = {
  new: {
    label: "New",
    classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  contacted: {
    label: "Contacted",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  won: {
    label: "Won",
    classes: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  lost: {
    label: "Lost",
    classes: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

export default function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchQuote = async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) setNotFound(true);
      else setQuote(data as Quote);
      setLoading(false);
    };
    fetchQuote();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!quote) return;
    setStatusUpdating(true);
    await supabase.from("quotes").update({ status }).eq("id", quote.id);
    setQuote({ ...quote, status: status as Quote["status"] });
    setStatusUpdating(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    await supabase.from("quotes").delete().eq("id", id);
    router.push("/admin");
  };

  const handleSendEmail = async () => {
    if (!quote) return;
    setSendingEmail(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: quote.email,
          subject: `Re: Your Project Quote — ${quote.project_type}`,
          message: emailMessage,
          clientName: quote.name,
        }),
      });
      if (res.ok) {
        setEmailSent(true);
        setShowEmailComposer(false);
        setEmailMessage("");
      }
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !quote) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium">Quote not found</p>
        <button
          onClick={() => router.push("/admin")}
          className="text-sm text-blue-500 hover:underline"
        >
          ← Back to dashboard
        </button>
      </div>
    );
  }

  const status = statusConfig[quote.status];

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Dashboard
        </button>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <select
            value={quote.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusUpdating}
            className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 sm:w-auto sm:text-xs"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.04 }}
        className="mb-6 rounded-2xl border border-border/50 bg-gradient-to-br from-blue-500/4 to-indigo-500/4 p-4 sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-base font-semibold sm:size-11">
              {quote.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
                <h1 className="break-words text-lg font-semibold sm:text-xl">
                  {quote.name}
                </h1>
                <span
                  className={cn(
                    "w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    status.classes,
                  )}
                >
                  {status.label}
                </span>
              </div>
              <p className="mt-0.5 break-all text-sm text-muted-foreground">
                {quote.email}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-1 lg:justify-items-end">
            <div className="flex items-center gap-1.5">
              <Briefcase className="size-3" />
              {quote.project_type}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3" />
              {new Date(quote.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-border/30 pt-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Project Description
          </p>
          <p className="text-sm leading-relaxed">{quote.description}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div className="rounded-2xl border border-border/50 bg-card/20 p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Clock className="size-3.5" />
            <span className="text-xs font-medium uppercase tracking-widest">
              Timeline
            </span>
          </div>
          <p className="text-xl font-semibold tracking-tight sm:text-2xl">
            {quote.estimated_timeline}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/4 p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-2 text-emerald-500">
            <IndianRupee className="size-3.5" />
            <span className="text-xs font-medium uppercase tracking-widest">
              Estimate
            </span>
          </div>
          <p className="break-words text-xl font-semibold tracking-tight sm:text-2xl">
            {quote.estimated_cost}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-4 rounded-2xl border border-border/50 bg-card/20 p-4 sm:p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <Layers className="size-3.5 text-blue-500" />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Services Matched
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quote.services_matched.map((s) => (
            <span
              key={s}
              className="rounded-lg border border-blue-500/20 bg-blue-500/8 px-3 py-1 text-xs font-medium text-blue-400"
            >
              {s}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
        className="mb-4 rounded-2xl border border-border/50 bg-card/20 p-4 sm:p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="size-3.5 text-blue-500" />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Project Summary
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {quote.summary}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.14 }}
        className="mb-4 rounded-2xl border border-border/50 bg-card/20 p-4 sm:p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-3.5 text-blue-500" />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Why Zaid Studio
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {quote.why_hire_me}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.16 }}
        className="mb-6 rounded-2xl border border-border/50 bg-card/20 p-4 sm:p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <ListChecks className="size-3.5 text-blue-500" />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Next Steps
          </span>
        </div>
        <ol className="flex flex-col gap-3">
          {quote.next_steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/8 text-[11px] font-medium text-blue-400 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground leading-relaxed">
                {s}
              </span>
            </li>
          ))}
        </ol>
      </motion.div>

      {showEmailComposer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-2xl border border-blue-500/15 bg-blue-500/4 p-4 sm:p-5"
        >
          <p className="mb-4 text-sm font-medium">Send email to {quote.name}</p>
          <div className="flex flex-col gap-3">
            <input
              value={`Re: Your Project Quote — ${quote.project_type}`}
              readOnly
              className="h-10 rounded-xl border border-border/50 bg-background/50 px-4 text-sm text-muted-foreground"
            />
            <textarea
              rows={4}
              placeholder="Write your message to the client..."
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              className="resize-none rounded-xl border border-border/60 bg-background px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail || !emailMessage.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
              >
                {sendingEmail ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Mail className="size-3.5" />
                )}
                {sendingEmail ? "Sending..." : "Send Email"}
              </button>
              <button
                onClick={() => {
                  setShowEmailComposer(false);
                  setEmailMessage("");
                }}
                className="rounded-xl border border-border/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.18 }}
        className="mb-8 flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/20 p-4 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <button
          onClick={() => handleStatusChange("contacted")}
          disabled={quote.status === "contacted" || statusUpdating}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          <CheckCircle2 className="size-3.5" />
          {quote.status === "contacted" ? "Contacted ✓" : "Mark as Contacted"}
        </button>

        <button
          onClick={() => setShowEmailComposer(!showEmailComposer)}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors sm:w-auto",
            emailSent
              ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-400"
              : "border-border/60 hover:bg-secondary/50",
          )}
        >
          <Mail className="size-3.5" />
          {emailSent ? "Email Sent ✓" : "Email Client"}
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors sm:ml-auto sm:w-auto",
            confirmDelete
              ? "bg-red-600 text-white hover:bg-red-700"
              : "border border-border/60 text-muted-foreground hover:border-red-500/30 hover:text-red-400",
          )}
        >
          {deleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
          {confirmDelete ? "Confirm Delete?" : "Delete Quote"}
        </button>
      </motion.div>
    </div>
  );
}
