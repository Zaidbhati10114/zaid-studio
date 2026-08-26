"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Download,
  Printer,
  SendHorizontal,
  GitBranch,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProposalPDF } from "@/app/components/ProposalPDF";

import { PdfViewer } from "@/app/(admin)/admin/(dashboard)/project-hub/components/pdf/PdfViewer";
import { RotateCw, Loader2 } from "lucide-react";
import { useProjectHub, useProposalVersion } from "@/hooks/useProposal";
import { useProposalPdf } from "@/hooks/useProposalPdf";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ProposalPreviewPage() {
  const router = useRouter();

  const params = useParams<{
    quoteId: string;
  }>();

  const quoteId = params.quoteId;

  const projectHub = useProjectHub(quoteId);
  const [selectedVersionId, setSelectedVersionId] = useState("draft");

  const selectedVersion = useProposalVersion(
    selectedVersionId === "draft" ? null : selectedVersionId,
  );

  const { pdfUrl, generating, generatePdf, downloadPdf } = useProposalPdf();

  const quote = projectHub.data?.quote;

  const activeProposal =
    selectedVersionId === "draft"
      ? projectHub.data?.proposalDraft
      : selectedVersion.data;
  //const hasGenerated = useRef(false);
  const handleRefresh = async () => {
    if (!activeProposal || !quote) return;

    await generatePdf(
      <ProposalPDF
        name={quote.name}
        project_type={quote.projectType}
        summary={activeProposal.summary}
        estimated_timeline={activeProposal.estimatedTimeline}
        estimated_cost={activeProposal.estimatedCost}
        complexity={activeProposal.complexity}
        deliverables={activeProposal.deliverables}
        tech_stack={activeProposal.techStack}
        phases={activeProposal.phases}
        client_responsibilities={activeProposal.clientResponsibilities}
        risks={activeProposal.risks}
        next_steps={activeProposal.nextSteps}
        quoteUrl=""
      />,
    );
  };
  useEffect(() => {
    if (!activeProposal || !quote) return;

    void handleRefresh();
  }, [activeProposal, quote]);

  if (projectHub.isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading proposal...
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex h-screen items-center justify-center">
        Project not found.
      </div>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-muted/30">
      {/* Header */}

      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-8">
          {/* Left */}

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

          {/* Right */}

          <div className="flex items-center gap-2">
            <Select
              value={selectedVersionId}
              onValueChange={setSelectedVersionId}
            >
              <SelectTrigger className="h-10 w-[170px] rounded-full border bg-muted/30 px-3 shadow-none transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />

                  <SelectValue />
                </div>
              </SelectTrigger>

              <SelectContent align="end">
                <SelectItem value="draft">✏️ Current Draft</SelectItem>

                {projectHub.data?.versions.map((version, index) => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.versionNumber === 0
                      ? "v0 • Original"
                      : index === 0
                        ? `v${version.versionNumber} • Latest`
                        : `v${version.versionNumber}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

      {/* Preview Info + PDF */}

      <div className="flex-1 overflow-hidden p-6">
        <div className="mx-auto flex h-full max-w-7xl flex-col gap-4">
          {/* Preview Info */}

          <div className="flex items-center justify-between rounded-xl border bg-background px-4 py-3">
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">
                  Previewing{" "}
                  {selectedVersionId === "draft"
                    ? "Current Draft"
                    : projectHub.data?.versions.find(
                          (v) => v.id === selectedVersionId,
                        )?.versionNumber === 0
                      ? "v0 • Original"
                      : `v${
                          projectHub.data?.versions.find(
                            (v) => v.id === selectedVersionId,
                          )?.versionNumber
                        }`}
                </p>

                <p className="text-xs text-muted-foreground">
                  {selectedVersionId === "draft"
                    ? "Unsaved changes will appear here."
                    : "Viewing a historical proposal version."}
                </p>
              </div>
            </div>

            {selectedVersionId !== "draft" && (
              <Badge variant="secondary">Read Only</Badge>
            )}
          </div>

          {/* PDF */}

          <div className="relative flex-1 overflow-hidden rounded-xl border bg-background shadow-sm">
            {pdfUrl && <PdfViewer file={pdfUrl} />}

            {generating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin" />

                <p className="mt-3 text-sm text-muted-foreground">
                  Generating PDF...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
