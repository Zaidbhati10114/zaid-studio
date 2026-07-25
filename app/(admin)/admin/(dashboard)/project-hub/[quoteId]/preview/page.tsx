"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { ArrowLeft, Download, Printer, SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProposalPDF } from "@/app/components/ProposalPDF";

import { PdfViewer } from "@/app/(admin)/admin/(dashboard)/project-hub/components/pdf/PdfViewer";
import { RotateCw, Loader2 } from "lucide-react";
import { useProjectHub } from "@/hooks/useProposal";
import { useProposalPdf } from "@/hooks/useProposalPdf";

export default function ProposalPreviewPage() {
  const router = useRouter();

  const params = useParams<{
    quoteId: string;
  }>();

  const quoteId = params.quoteId;

  const projectHub = useProjectHub(quoteId);

  const { pdfUrl, generating, generatePdf, downloadPdf } = useProposalPdf();

  const draft = projectHub.data?.proposalDraft;

  const quote = projectHub.data?.quote;
  //const hasGenerated = useRef(false);
  const handleRefresh = async () => {
    if (!draft || !quote) return;

    await generatePdf(
      <ProposalPDF
        name={quote.name}
        project_type={quote.projectType}
        summary={draft.summary}
        estimated_timeline={draft.estimatedTimeline}
        estimated_cost={draft.estimatedCost}
        complexity={draft.complexity}
        deliverables={draft.deliverables}
        tech_stack={draft.techStack}
        phases={draft.phases}
        client_responsibilities={draft.clientResponsibilities}
        risks={draft.risks}
        next_steps={draft.nextSteps}
        quoteUrl=""
      />,
    );
  };
  useEffect(() => {
    if (!draft || !quote) return;

    void handleRefresh();
  }, [draft, quote]);

  if (projectHub.isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading proposal...
      </div>
    );
  }

  if (!draft || !quote) {
    return (
      <div className="flex h-screen items-center justify-center">
        Proposal not found.
      </div>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-muted/30">
      {/* Header */}

      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/admin/project-hub/${quoteId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Builder
            </Button>

            <div>
              <h1 className="text-lg font-semibold">Proposal Preview</h1>

              <p className="text-sm text-muted-foreground">
                Review the proposal before sending it.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={generating}
            >
              <RotateCw
                className={`mr-2 h-4 w-4 ${generating ? "animate-spin" : ""}`}
              />
              Refresh Preview
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadPdf(`proposal-${quote.name}.pdf`)}
              disabled={!pdfUrl}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>

            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>

            <Button>
              <SendHorizontal className="mr-2 h-4 w-4" />
              Send Proposal
            </Button>
          </div>
        </div>
      </header>

      {/* PDF */}

      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full overflow-hidden rounded-xl border bg-background shadow-sm">
          {generating ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <PdfViewer file={pdfUrl} />
          )}
        </div>
      </div>
    </main>
  );
}
