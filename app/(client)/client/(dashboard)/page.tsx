"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Briefcase, Calendar, Clock } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface Workspace {
  id: string;
  client_name: string;
  business_name: string;
  status: string;
  created_at: string;
}

const statusLabels: Record<string, { label: string; classes: string }> = {
  onboarding: {
    label: "Onboarding",
    classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  in_progress: {
    label: "In Progress",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  delivered: {
    label: "Delivered",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  maintenance: {
    label: "Maintenance",
    classes: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
};

export default function ClientWorkspacePage() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/client/login");
        return;
      }

      const email = session.session.user.email;
      const { data, error } = await supabase
        .from("client_workspaces")
        .select("*")
        .eq("client_email", email)
        .single();

      if (cancelled) return;

      if (error || !data) {
        setNotFound(true);
      } else {
        setWorkspace(data as Workspace);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !workspace) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium">No workspace found</p>
        <p className="text-sm text-muted-foreground">
          Contact us if you believe this is a mistake.
        </p>
      </div>
    );
  }

  const status = statusLabels[workspace.status] ?? statusLabels.onboarding;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 rounded-2xl border border-border/50 bg-gradient-to-br from-blue-500/4 to-indigo-500/4 p-5 sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold sm:text-xl">
              Welcome, {workspace.client_name}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {workspace.business_name}
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${status.classes}`}
          >
            {status.label}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 border-t border-border/30 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Briefcase className="size-3" />
            {workspace.business_name}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3" />
            Started{" "}
            {new Date(workspace.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </motion.div>

      {/* Placeholder for what comes next */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="flex min-h-[30vh] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/50 text-center"
      >
        <Clock className="size-6 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Documents, project data, and progress tracking will appear here
        </p>
      </motion.div>
    </div>
  );
}
