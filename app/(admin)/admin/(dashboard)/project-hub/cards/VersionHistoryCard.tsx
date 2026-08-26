"use client";

import {
  GitBranch,
  Eye,
  PenLine,
  SendHorizontal,
  Sparkles,
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProposalCard } from "../components/layout/shared/ProposalCard";

interface ProposalVersion {
  id: string;
  versionNumber: number;
  status: "saved" | "sent" | "failed";
  createdAt: string;
  sentAt: string | null;
}

interface VersionHistoryCardProps {
  versions: ProposalVersion[];
  viewingDraft: boolean;
  onPreview: (versionId: string) => void;
  onResend?: (versionId: string) => void;
  isResending?: boolean;
  resendingVersionId?: string | null;
}

export function VersionHistoryCard({
  versions,
  onPreview,
  onResend,
  isResending = false,
  resendingVersionId = null,
  viewingDraft,
}: VersionHistoryCardProps) {
  return (
    <ProposalCard
      title="Version History"
      description="Current draft and immutable proposal snapshots."
    >
      <div className="space-y-4">
        <div
          className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
            viewingDraft
              ? "border-blue-500/20 bg-blue-500/5"
              : "border-border bg-background"
          }`}
        >
          {" "}
          <div className="flex items-start gap-3">
            <PenLine className="mt-1 h-5 w-5 text-blue-400" />

            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">Current Draft</p>

                {viewingDraft && (
                  <Badge
                    variant="outline"
                    className="border-blue-500/30 text-blue-400"
                  >
                    Editing
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Live working copy. Preview from the top toolbar.
              </p>
            </div>
          </div>
        </div>

        {versions.length > 0 && (
          <div className="relative pl-6">
            <div className="absolute left-[10px] top-5 bottom-8 w-px bg-border" />

            <div className="space-y-4">
              {versions.map((version, index) => {
                const isLatest = index === versions.length - 1;
                const isOriginal = version.versionNumber === 0;

                return (
                  <div key={version.id} className="relative">
                    <div
                      className={`absolute -left-[21px] top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        isLatest
                          ? "border-green-500 bg-green-500"
                          : isOriginal
                            ? "border-blue-500 bg-blue-500"
                            : "border-muted-foreground bg-background"
                      }`}
                    >
                      {isLatest ? (
                        <SendHorizontal className="h-3 w-3 text-white" />
                      ) : isOriginal ? (
                        <Sparkles className="h-3 w-3 text-white" />
                      ) : (
                        <GitBranch className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>

                    <div
                      className={`rounded-xl border p-4 transition-colors ${
                        isLatest
                          ? "border-green-500/30 bg-green-500/5"
                          : "hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">
                              {isOriginal
                                ? "v0 • Original"
                                : `v${version.versionNumber}`}
                            </p>

                            {isLatest && (
                              <Badge className="bg-green-600 hover:bg-green-600">
                                Latest
                              </Badge>
                            )}

                            {version.status === "sent" && <Badge>Sent</Badge>}
                          </div>

                          <p className="text-xs text-muted-foreground">
                            {version.status === "sent" && version.sentAt
                              ? `Sent ${new Date(version.sentAt).toLocaleDateString()}`
                              : `Saved ${new Date(version.createdAt).toLocaleDateString()}`}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => onPreview(version.id)}
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Preview
                          </Button>

                          {version.status === "sent" && onResend && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full cursor-pointer"
                              disabled={isResending}
                              onClick={() => onResend(version.id)}
                            >
                              {isResending &&
                              resendingVersionId === version.id ? (
                                <>
                                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <SendHorizontal className="mr-1 h-3.5 w-3.5" />
                                  Resend
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {versions.length === 0 && (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No proposal revisions yet.
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Your first revision will appear here after it&apos;s created.
            </p>
          </div>
        )}
      </div>
    </ProposalCard>
  );
}
