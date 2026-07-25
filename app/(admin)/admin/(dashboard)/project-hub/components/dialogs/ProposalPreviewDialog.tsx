"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Download, Loader2, SendHorizontal } from "lucide-react";
import { PdfViewer } from "../pdf/PdfViewer";

interface ProposalPreviewDialogProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  pdfUrl: string | null;

  generating: boolean;

  sending: boolean;

  onDownload: () => void;

  onSend: () => void;
}

export function ProposalPreviewDialog({
  open,
  onOpenChange,
  pdfUrl,
  generating,
  sending,
  onDownload,
  onSend,
}: ProposalPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          flex
          h-[96vh]
          w-[98vw]
          max-w-[1600px]
          flex-col
          overflow-hidden
          p-0
        "
      >
        {/* Header */}

        <DialogHeader className="shrink-0 border-b px-8 py-5">
          <DialogTitle className="text-2xl">Proposal Preview</DialogTitle>

          <p className="text-sm text-muted-foreground">
            Review the proposal before sending it to your client.
          </p>
        </DialogHeader>

        {/* Preview */}

        <div className="flex-1 overflow-hidden bg-muted/40 p-2">
          <div className="h-full overflow-hidden rounded-lg border bg-background shadow-sm">
            {generating ? (
              <div className="flex h-full flex-col items-center justify-center gap-5">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />

                <div className="space-y-2 text-center">
                  <h3 className="font-semibold">Preparing Preview</h3>

                  <p className="text-sm text-muted-foreground">
                    Generating your proposal PDF...
                  </p>
                </div>
              </div>
            ) : pdfUrl ? (
              <PdfViewer file={pdfUrl} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <p className="font-medium">No Preview Available</p>

                <p className="text-sm text-muted-foreground">
                  Generate a proposal preview first.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}

        <div className="flex shrink-0 items-center justify-between gap-8 border-t bg-background px-8 py-5">
          <div className="max-w-md">
            <p className="font-semibold">Ready to send?</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Review every section carefully before sending this proposal to
              your client.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onDownload}
              disabled={!pdfUrl || generating}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>

            <Button
              onClick={onSend}
              disabled={!pdfUrl || generating || sending}
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <SendHorizontal className="mr-2 h-4 w-4" />
                  Send Proposal
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
