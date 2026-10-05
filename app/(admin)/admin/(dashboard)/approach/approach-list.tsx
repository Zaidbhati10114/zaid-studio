"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Globe,
  MessageSquare,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ApproachMessage = {
  id: string;
  content: string;
  selected: boolean;
  created_at: string;
};

type ApproachLead = {
  id: string;
  business_name: string;
  business_details: string;
  has_website: boolean;
  extra_notes: string | null;
  status: "new" | "contacted" | "replied" | "interested" | "not_interested";
  website_analysis: unknown;
  created_at: string;
  updated_at: string;
  message_count: number;
  selected_message: ApproachMessage | null;
};

type ApproachLeadsResponse = {
  success: boolean;
  leads: ApproachLead[];
  error?: string;
};

const STATUS_OPTIONS = [
  {
    value: "all",
    label: "All statuses",
  },
  {
    value: "new",
    label: "New",
  },
  {
    value: "contacted",
    label: "Contacted",
  },
  {
    value: "replied",
    label: "Replied",
  },
  {
    value: "interested",
    label: "Interested",
  },
  {
    value: "not_interested",
    label: "Not interested",
  },
] as const;

function getStatusLabel(status: ApproachLead["status"]) {
  switch (status) {
    case "new":
      return "New";
    case "contacted":
      return "Contacted";
    case "replied":
      return "Replied";
    case "interested":
      return "Interested";
    case "not_interested":
      return "Not interested";
  }
}

function getStatusClassName(status: ApproachLead["status"]) {
  switch (status) {
    case "new":
      return "border-border bg-muted text-muted-foreground";

    case "contacted":
      return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400";

    case "replied":
      return "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400";

    case "interested":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

    case "not_interested":
      return "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400";
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

async function fetchApproachLeads(): Promise<ApproachLeadsResponse> {
  const response = await fetch("/api/admin/approach-messages", {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to load approach prospects.");
  }

  return data;
}

export function ApproachList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["approach-leads"],
    queryFn: fetchApproachLeads,
  });

  const leads = data?.leads ?? [];

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !normalizedSearch ||
        lead.business_name.toLowerCase().includes(normalizedSearch) ||
        lead.business_details.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-5 text-muted-foreground" />

            <h1 className="text-2xl font-semibold tracking-tight">Approach</h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your prospects and generated outreach messages.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/approach/new">
            <Plus className="size-4" />
            New Prospect
          </Link>
        </Button>
      </div>

      <Card>
        <div className="border-b p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search prospects..."
                className="pl-9"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-48"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {filteredLeads.length}{" "}
              {filteredLeads.length === 1 ? "prospect" : "prospects"}
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="hover:text-foreground"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[calc(100vh-18rem)] min-h-48 overflow-y-auto p-4">
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-xl border p-5">
                  <div className="space-y-3">
                    <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
                    <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
                    <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
              <p className="text-sm font-medium">Could not load prospects</p>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "Something went wrong while loading your prospects."}
              </p>
            </div>
          )}

          {!isLoading && !isError && leads.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-muted">
                <Users className="size-5 text-muted-foreground" />
              </div>

              <p className="text-sm font-medium">No prospects yet</p>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Add your first prospect and generate a personalized approach
                message.
              </p>

              <Button asChild className="mt-5">
                <Link href="/admin/approach/new">
                  <Plus className="size-4" />
                  Add Prospect
                </Link>
              </Button>
            </div>
          )}

          {!isLoading &&
            !isError &&
            leads.length > 0 &&
            filteredLeads.length === 0 && (
              <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
                <Search className="mb-3 size-5 text-muted-foreground" />

                <p className="text-sm font-medium">No matching prospects</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try changing your search or status filter.
                </p>
              </div>
            )}

          {!isLoading && !isError && filteredLeads.length > 0 && (
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/approach/${lead.id}`}
                  className="block"
                >
                  <div className="rounded-xl border p-5 transition-colors hover:bg-muted/30">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-base font-semibold">
                            {lead.business_name}
                          </h2>

                          <Badge
                            variant="outline"
                            className={getStatusClassName(lead.status)}
                          >
                            {getStatusLabel(lead.status)}
                          </Badge>
                        </div>

                        <p className="mt-1 line-clamp-2 max-w-3xl text-sm text-muted-foreground">
                          {lead.business_details}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Globe className="size-3.5" />

                            {lead.has_website ? "Website" : "No website"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <MessageSquare className="size-3.5" />
                            {lead.message_count}{" "}
                            {lead.message_count === 1 ? "message" : "messages"}
                          </span>

                          <span>Created {formatDate(lead.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                        <span className="hidden sm:inline">View prospect</span>

                        <ArrowUpRight className="size-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
