"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase, type Quote } from "@/lib/supabase";
import {
  Inbox,
  CheckCircle2,
  Layers,
  TrendingUp,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  new: "border-blue-500/20 bg-blue-500/8 text-blue-400",
  contacted: "border-emerald-500/20 bg-emerald-500/8 text-emerald-400",
  won: "border-purple-500/20 bg-purple-500/8 text-purple-400",
  lost: "border-red-500/20 bg-red-500/8 text-red-400",
};

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  won: "Won",
  lost: "Lost",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setQuotes(data as Quote[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setQuotes(data as Quote[]);
        setLoading(false);
      });
  }, []);

  const stats = {
    total: quotes.length,
    unread: quotes.filter((q) => q.status === "new").length,
    contacted: quotes.filter((q) => q.status === "contacted").length,
    topType: quotes.length
      ? Object.entries(
          quotes.reduce(
            (acc, q) => {
              acc[q.project_type] = (acc[q.project_type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
        ).sort((a, b) => b[1] - a[1])[0]?.[0]
      : "N/A",
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setDeletingId(id);
    await supabase.from("quotes").delete().eq("id", id);
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  const handleStatusChange = async (id: string, status: string) => {
    setStatusUpdating(id);
    await supabase.from("quotes").update({ status }).eq("id", id);
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, status: status as Quote["status"] } : q,
      ),
    );
    setStatusUpdating(null);
  };

  const statCards = [
    {
      label: "Total Quotes",
      value: stats.total,
      icon: Layers,
      color: "text-foreground",
    },
    {
      label: "Unread / New",
      value: stats.unread,
      icon: Inbox,
      color: "text-blue-500",
    },
    {
      label: "Contacted",
      value: stats.contacted,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: "Top Project Type",
      value: stats.topType,
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            {quotes.length} total quote{quotes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={fetchQuotes}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground sm:w-auto"
        >
          <RefreshCw className="size-3" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="rounded-2xl border border-border/50 bg-card/20 p-4 sm:p-5"
          >
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <s.icon className={cn("size-3.5", s.color)} />
            </div>
            <p
              className={cn(
                "truncate text-xl font-semibold tracking-tight sm:text-2xl",
                s.color,
              )}
            >
              {s.value}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="overflow-hidden rounded-2xl border border-border/50 bg-card/20"
      >
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-4 sm:px-6">
          <h2 className="text-sm font-medium">Recent Quotes</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl border border-border/50 bg-secondary/30">
              <Inbox className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No quotes yet</p>
              <p className="text-xs text-muted-foreground">
                Quotes will appear here when clients submit project requests.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border/30 md:hidden">
              {quotes.map((q) => (
                <div
                  key={q.id}
                  className="space-y-4 px-4 py-4"
                  onClick={() => router.push(`/admin/quotes/${q.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{q.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {q.email}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/quotes/${q.id}`);
                      }}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Eye className="size-3" />
                      View
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-border/40 bg-background/40 p-3">
                      <p className="mb-1 uppercase tracking-widest text-[10px] text-muted-foreground">
                        Project
                      </p>
                      <p className="text-sm text-foreground">{q.project_type}</p>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/40 p-3">
                      <p className="mb-1 uppercase tracking-widest text-[10px] text-muted-foreground">
                        Date
                      </p>
                      <p className="text-sm text-foreground">
                        {new Date(q.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <select
                      value={q.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(q.id, e.target.value)}
                      disabled={statusUpdating === q.id}
                      className={cn(
                        "w-full rounded-full border px-3 py-2 text-xs font-medium outline-none md:w-auto",
                        statusColors[q.status],
                      )}
                    >
                      {Object.entries(statusLabels).map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(q.id);
                      }}
                      disabled={deletingId === q.id}
                      className={cn(
                        "inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs transition-colors",
                        confirmDeleteId === q.id
                          ? "border-red-500/30 bg-red-500/8 text-red-400"
                          : "border-border/50 text-muted-foreground hover:text-red-400",
                      )}
                    >
                      {deletingId === q.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                      {confirmDeleteId === q.id ? "Sure?" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-secondary/20">
                  {["Client", "Project Type", "Date", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {quotes.map((q) => (
                  <tr
                    key={q.id}
                    className="group cursor-pointer hover:bg-secondary/20 transition-colors"
                    onClick={() => router.push(`/admin/quotes/${q.id}`)}
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">{q.name}</p>
                      <p className="text-xs text-muted-foreground">{q.email}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {q.project_type}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(q.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={q.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          handleStatusChange(q.id, e.target.value)
                        }
                        disabled={statusUpdating === q.id}
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] font-medium outline-none cursor-pointer",
                          statusColors[q.status],
                        )}
                      >
                        {Object.entries(statusLabels).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => router.push(`/admin/quotes/${q.id}`)}
                          className="flex items-center gap-1 rounded-lg border border-border/50 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye className="size-3" /> View
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          disabled={deletingId === q.id}
                          className={cn(
                            "flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs transition-colors",
                            confirmDeleteId === q.id
                              ? "border-red-500/30 bg-red-500/8 text-red-400"
                              : "border-border/50 text-muted-foreground hover:text-red-400",
                          )}
                        >
                          {deletingId === q.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Trash2 className="size-3" />
                          )}
                          {confirmDeleteId === q.id ? "Sure?" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
