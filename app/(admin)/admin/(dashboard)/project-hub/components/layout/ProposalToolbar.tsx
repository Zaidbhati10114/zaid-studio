"use client";

import { Sparkles, Save, SendHorizontal, GitBranch } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProposalVersion } from "@/hooks/useProposal";

interface ProposalToolbarProps {
  title: string;
  status: "draft" | "sent";

  isGenerating: boolean;
  isSaving: boolean;
  isCreatingRevision?: boolean;

  viewingVersion: boolean;
  onEditVersion: () => void;

  dirty: boolean;
  isBusy?: boolean;

  quoteId: string;

  versions: ProposalVersion[];
  selectedVersionId: string;

  onVersionChange: (value: string) => void;

  onBack: () => void;
  onGenerate: () => void;
  onSave: () => void;
  onCreateRevision: () => void;
  onPreview: () => void;
  onSend: () => void;
}

export function ProposalToolbar({
  status,
  isGenerating,
  isSaving,
  isCreatingRevision,
  onGenerate,
  onSave,
  onCreateRevision,
  dirty,
  isBusy,
  quoteId,
  versions,
  selectedVersionId,
  onVersionChange,
  onSend,
  viewingVersion,
  onEditVersion,
}: ProposalToolbarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-8">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Proposal Builder</h1>

          <div className="flex items-center gap-2">
            <Badge variant={status === "draft" ? "secondary" : "default"}>
              {status === "draft" ? "Draft" : "Sent"}
            </Badge>

            <Select value={selectedVersionId} onValueChange={onVersionChange}>
              <SelectTrigger className="w-44 h-8">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="draft">Current Draft</SelectItem>

                {versions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.versionNumber === 0
                      ? "v0 • Original"
                      : `v${version.versionNumber}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onGenerate} disabled={isBusy}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI
              </>
            )}
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {viewingVersion ? (
            <Button variant="outline" onClick={onEditVersion} disabled={isBusy}>
              <GitBranch className="mr-2 h-4 w-4" />
              Edit this Version
            </Button>
          ) : (
            <>
              <Button onClick={onSave} disabled={!dirty || isBusy}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={onCreateRevision}
                disabled={isBusy}
              >
                {isCreatingRevision ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <GitBranch className="mr-2 h-4 w-4" />
                    Create Revision
                  </>
                )}
              </Button>
            </>
          )}

          <Button
            onClick={() => router.push(`/admin/project-hub/${quoteId}/preview`)}
            disabled={isBusy}
          >
            <SendHorizontal className="mr-2 h-4 w-4" />
            Preview Proposal
          </Button>

          <Button onClick={onSend} disabled={isBusy}>
            <SendHorizontal className="mr-2 h-4 w-4" />
            Send Proposal
          </Button>
        </div>
      </div>
    </header>
  );
}
