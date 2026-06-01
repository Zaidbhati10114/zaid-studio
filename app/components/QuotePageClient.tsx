"use client";

import * as Sentry from "@sentry/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { quoteKeys, type GeneratedQuote } from "@/hooks/useQuote";
import QuoteClient from "./QuoteClient";

interface Props {
  id: string;
  fallbackQuote: Record<string, unknown>;
}

function normalizeQuote(
  cached: GeneratedQuote & { id: string },
  fallback: Record<string, unknown>,
) {
  // Cache uses camelCase from the API response
  // QuoteClient reads snake_case from DB — map them here
  return {
    // Identity fields come from DB fallback (cache doesn't have name/email/project_type)
    name: fallback.name,
    email: fallback.email,
    project_type: fallback.project_type,
    description: fallback.description,
    // AI fields — map camelCase → snake_case
    summary: cached.summary,
    estimated_timeline: cached.estimatedTimeline,
    estimated_cost: cached.estimatedCost,
    complexity: cached.complexity,
    deliverables: cached.deliverables,
    tech_stack: cached.techStack,
    phases: cached.phases,
    client_responsibilities: cached.clientResponsibilities,
    risks: cached.risks,
    next_steps: cached.nextSteps,
  };
}

export default function QuotePageClient({ id, fallbackQuote }: Props) {
  const queryClient = useQueryClient();
  const cached = queryClient.getQueryData<GeneratedQuote & { id: string }>(
    quoteKeys.detail(id),
  );

  // Use normalized cache if available, otherwise fall straight to DB data
  const quote = cached ? normalizeQuote(cached, fallbackQuote) : fallbackQuote;

  return (
    <Sentry.ErrorBoundary
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-6">
          <p className="text-lg font-medium">Something went wrong</p>
          <p className="text-sm text-muted-foreground">
            Your proposal exists but couldn&apos;t be displayed.
          </p>
          <a href="/get-quote" className="text-blue-500 underline">
            Generate a New Quote
          </a>
        </div>
      }
      beforeCapture={(scope) => {
        scope.setTag("layer", "quote_render");
        scope.setExtra("quoteId", id);
      }}
    >
      <QuoteClient quote={quote as any} id={id} isSample={false} />
    </Sentry.ErrorBoundary>
  );
}
