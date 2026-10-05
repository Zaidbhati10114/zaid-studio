"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Globe,
  Loader2,
  MessageSquare,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/dist/client/components/navigation";

type ApproachMessage = {
  id: string;
  approach_lead_id: string;
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
};

type ApproachDetailResponse = {
  success: boolean;
  lead: ApproachLead;
  messages: ApproachMessage[];
  error?: string;
};

const STATUS_OPTIONS = [
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
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

async function fetchApproachDetail(
  id: string,
): Promise<ApproachDetailResponse> {
  const response = await fetch(`/api/admin/approach-messages/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to load approach prospect.");
  }

  return data;
}

export function ApproachDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectingMessageId, setSelectingMessageId] = useState<string | null>(
    null,
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["approach-lead", id],
    queryFn: () => fetchApproachDetail(id),
  });

  async function handleCopy(message: ApproachMessage) {
    try {
      await navigator.clipboard.writeText(message.content);

      setCopiedMessageId(message.id);

      window.setTimeout(() => {
        setCopiedMessageId((current) =>
          current === message.id ? null : current,
        );
      }, 2000);
    } catch {
      setError("Could not copy the message.");
    }
  }

  async function handleRegenerate() {
    if (!data?.lead) {
      return;
    }

    setError(null);

    try {
      setIsRegenerating(true);

      const response = await fetch(
        `/api/admin/approach-messages/${data.lead.id}/regenerate`,
        {
          method: "POST",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to regenerate approach message.",
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ["approach-lead", id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["approach-leads"],
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to regenerate approach message.",
      );
    } finally {
      setIsRegenerating(false);
    }
  }

  async function handleSelectMessage(messageId: string) {
    if (!data?.lead) {
      return;
    }

    setError(null);

    try {
      setSelectingMessageId(messageId);

      const response = await fetch(
        `/api/admin/approach-messages/${data.lead.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to select approach message.");
      }

      await queryClient.invalidateQueries({
        queryKey: ["approach-lead", id],
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to select approach message.",
      );
    } finally {
      setSelectingMessageId(null);
    }
  }

  async function handleStatusChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    if (!data?.lead) {
      return;
    }

    const status = event.target.value;

    setError(null);

    try {
      setIsUpdatingStatus(true);

      const response = await fetch(
        `/api/admin/approach-messages/${data.lead.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update lead status.");
      }

      await queryClient.invalidateQueries({
        queryKey: ["approach-lead", id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["approach-leads"],
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update lead status.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleDelete() {
    if (!data?.lead) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/approach-messages/${data.lead.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete prospect.");
      }

      await queryClient.invalidateQueries({
        queryKey: ["approach-leads"],
      });

      router.push("/admin/approach");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete prospect.",
      );

      setIsDeleting(false);
    }
  }
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              <div className="h-20 animate-pulse rounded bg-muted" />
              <div className="h-12 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              <div className="h-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !data?.lead) {
    return (
      <div className="mx-auto flex min-h-72 w-full max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-medium">Could not load this prospect</p>

        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {queryError instanceof Error
            ? queryError.message
            : "The prospect could not be found."}
        </p>

        <Button asChild variant="outline" className="mt-5">
          <Link href="/admin/approach">
            <ArrowLeft className="size-4" />
            Back to Approach
          </Link>
        </Button>
      </div>
    );
  }

  const lead = data.lead;
  const messages = data.messages ?? [];
  const latestMessage = messages[0] ?? null;
  const previousMessages = messages.slice(1);

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="mt-0.5 shrink-0"
            >
              <Link href="/admin/approach" aria-label="Back to Approach">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {lead.business_name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={getStatusClassName(lead.status)}
                >
                  {
                    STATUS_OPTIONS.find(
                      (option) => option.value === lead.status,
                    )?.label
                  }
                </Badge>

                <span className="text-xs text-muted-foreground">
                  Created {formatDate(lead.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={lead.status}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {isUpdatingStatus && (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Business details</CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Business name
                  </p>

                  <p className="mt-1 text-sm">{lead.business_name}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Details
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                    {lead.business_details}
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-lg border p-3">
                  <Globe className="size-4 text-muted-foreground" />

                  <div>
                    <p className="text-sm font-medium">
                      {lead.has_website ? "Has a website" : "No website"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {lead.has_website
                        ? "Website-aware messaging is enabled."
                        : "Messaging focuses on building an online presence."}
                    </p>
                  </div>
                </div>

                {lead.extra_notes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Extra notes
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                      {lead.extra_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prospect activity</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="size-4" />
                    Generated messages
                  </span>

                  <span className="text-sm font-medium">{messages.length}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last updated</span>

                  <span>{formatDate(lead.updated_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Generated message
                    </CardTitle>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {messages.length}{" "}
                      {messages.length === 1 ? "version" : "versions"} saved
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="size-4" />
                        Regenerate
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {latestMessage ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-muted/30 p-5">
                      <p className="whitespace-pre-wrap text-sm leading-7">
                        {latestMessage.content}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(latestMessage)}
                      >
                        {copiedMessageId === latestMessage.id ? (
                          <>
                            <Check className="size-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-4" />
                            Copy Message
                          </>
                        )}
                      </Button>

                      {latestMessage.selected && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        >
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
                    <MessageSquare className="mb-3 size-5 text-muted-foreground" />

                    <p className="text-sm font-medium">No generated message</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Generate the first approach message using the button
                      above.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {previousMessages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Previous versions</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {previousMessages.map((message, index) => (
                    <div key={message.id} className="rounded-xl border p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            Version {messages.length - index - 1}
                          </span>

                          {message.selected && (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            >
                              Selected
                            </Badge>
                          )}
                        </div>

                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.created_at)}
                        </span>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {message.content}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(message)}
                        >
                          {copiedMessageId === message.id ? (
                            <>
                              <Check className="size-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-4" />
                              Copy
                            </>
                          )}
                        </Button>

                        {!message.selected && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectMessage(message.id)}
                            disabled={selectingMessageId === message.id}
                          >
                            {selectingMessageId === message.id ? (
                              <>
                                <Loader2 className="size-4 animate-spin" />
                                Selecting...
                              </>
                            ) : (
                              "Use this version"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setDeleteDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete prospect?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {data?.lead?.business_name}
              </span>{" "}
              and all generated message versions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Prospect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
