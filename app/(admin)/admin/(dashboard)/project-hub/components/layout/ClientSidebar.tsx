"use client";

import { User2, FolderOpen, NotebookPen, Info } from "lucide-react";

import { Quote } from "@/lib/models/quote";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface ClientSidebarProps {
  quote: Quote;

  adminNotes: string;
  onAdminNotesChange: (value: string) => void;
}

export function ClientSidebar({
  quote,
  adminNotes,
  onAdminNotesChange,
}: ClientSidebarProps) {
  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] w-[360px] shrink-0 overflow-y-auto border-r bg-muted/20">
      <div className="space-y-5 p-6">
        {/* Page Title */}

        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Project Context</h2>

          <p className="text-sm text-muted-foreground">
            Everything you need while preparing this proposal.
          </p>
        </div>

        {/* Client */}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User2 className="h-4 w-4" />
              Client
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">{quote.name}</p>

              <p className="text-muted-foreground">{quote.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Project */}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="h-4 w-4" />
              Project
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Type" value={quote.projectType} />

            <Separator />

            <InfoRow label="Budget" value={quote.estimatedCost} />

            <Separator />

            <InfoRow label="Timeline" value={quote.estimatedTimeline} />

            <Separator />

            <InfoRow
              label="Complexity"
              value={<Badge variant="secondary">{quote.complexity}</Badge>}
            />
          </CardContent>
        </Card>

        {/* Meeting Notes */}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <NotebookPen className="h-4 w-4" />
              Meeting Notes
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Textarea
              rows={8}
              placeholder="Capture client discussions, requested changes, ideas, and decisions..."
              value={adminNotes}
              onChange={(e) => onAdminNotesChange(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Metadata */}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4" />
              Metadata
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <InfoRow
              label="Quote ID"
              value={
                <span className="font-mono text-xs">
                  {quote.id.slice(0, 8)}
                </span>
              }
            />

            <Separator />

            <InfoRow label="Created" value={formatDate(quote.createdAt)} />

            <Separator />

            <InfoRow
              label="Status"
              value={<Badge variant="outline">Draft</Badge>}
            />

            <Separator />

            <InfoRow label="Version" value="v1" />
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>

      <div className="text-right font-medium">{value}</div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
