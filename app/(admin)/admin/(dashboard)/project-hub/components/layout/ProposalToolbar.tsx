"use client";

import { Sparkles, Save, SendHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProposalToolbarProps {
  title: string;

  status: "draft" | "sent";

  isGenerating: boolean;

  isSaving: boolean;

  dirty: boolean;

  onBack: () => void;

  onGenerate: () => void;

  onSave: () => void;

  onPreview: () => void;

  onSend: () => void;
  isBusy?: boolean;
  quoteId: string;
}

export function ProposalToolbar({
  isGenerating,
  isSaving,
  onGenerate,
  onSave,
  dirty,
  onSend,
  isBusy,
  onPreview,
  quoteId,
}: ProposalToolbarProps) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-8">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Proposal Builder</h1>

          <Badge variant={status === "draft" ? "secondary" : "default"}>
            {status === "draft" ? "Draft" : "Sent"}
          </Badge>
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
