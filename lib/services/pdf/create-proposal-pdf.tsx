import React from "react";

import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";

import { ProposalPDF } from "@/app/components/ProposalPDF";
import { QuotePhase, QuoteRisk } from "@/hooks/useQuote";

interface CreateProposalPdfParams {
  clientName: string;

  projectType: string;

  quoteUrl: string;

  summary: string;

  estimatedTimeline: string;

  estimatedCost: string;

  complexity: string;

  deliverables: string[];

  techStack: string[];

  phases: QuotePhase[];

  clientResponsibilities: string[];

  risks: QuoteRisk[];

  nextSteps: string[];
}

export async function createProposalPdf({
  clientName,
  projectType,
  quoteUrl,
  summary,
  estimatedTimeline,
  estimatedCost,
  complexity,
  deliverables,
  techStack,
  phases,
  clientResponsibilities,
  risks,
  nextSteps,
}: CreateProposalPdfParams) {
  const document = (
    <ProposalPDF
      name={clientName}
      project_type={projectType}
      summary={summary}
      estimated_timeline={estimatedTimeline}
      estimated_cost={estimatedCost}
      complexity={complexity}
      deliverables={deliverables}
      tech_stack={techStack}
      phases={phases}
      client_responsibilities={clientResponsibilities}
      risks={risks}
      next_steps={nextSteps}
      quoteUrl={quoteUrl}
    />
  ) as React.ReactElement<DocumentProps>;

  return renderToBuffer(document);
}
