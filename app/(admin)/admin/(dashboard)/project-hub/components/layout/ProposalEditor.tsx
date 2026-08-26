"use client";

import { CostCard } from "../../cards/CostCard";
import { DeliverablesCard } from "../../cards/DeliverablesCard";
import { SummaryCard } from "../../cards/SummaryCard";
import { TimelineCard } from "../../cards/TimelineCard";
import { ClientResponsibilitiesCard } from "./cards/ClientResponsiblitiesCard";
import { CommercialTermsCard } from "./cards/CommericialTermsCard";
import { NextStepsCard } from "./cards/NextStepsCard";
import { PhasesCard } from "./cards/PhaseCard";
import { RisksCard } from "./cards/RisksCard";
import { TechStackCard } from "./cards/TechStackCard";
import { SectionHeading } from "./shared/SectionHeading";

interface ProposalEditorProps {
  readOnly?: boolean;
}

export function ProposalEditor({ readOnly = false }: ProposalEditorProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-muted/20">
      <div className="mx-auto max-w-6xl space-y-12 p-8">
        {readOnly && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            Viewing a saved revision. Click <strong>Edit this Version</strong>{" "}
            to create a new working draft.
          </div>
        )}

        {/* Overview */}
        <section className="space-y-6">
          <SectionHeading
            title="Overview"
            description="High-level project summary and commercial estimate."
          />

          <SummaryCard readOnly={readOnly} />

          <div className="grid gap-6 lg:grid-cols-2">
            <TimelineCard readOnly={readOnly} />
            <CostCard readOnly={readOnly} />
          </div>
        </section>

        {/* Scope */}
        <section className="space-y-6">
          <SectionHeading
            title="Project Scope"
            description="Everything included in this proposal."
          />

          <DeliverablesCard readOnly={readOnly} />
          <TechStackCard readOnly={readOnly} />
        </section>

        {/* Execution */}
        <section className="space-y-6">
          <SectionHeading
            title="Execution"
            description="How the project will be delivered."
          />

          <PhasesCard readOnly={readOnly} />
          <ClientResponsibilitiesCard readOnly={readOnly} />
        </section>

        {/* Delivery */}
        <section className="space-y-6">
          <SectionHeading
            title="Delivery"
            description="Project risks and next steps."
          />

          <RisksCard readOnly={readOnly} />
          <NextStepsCard readOnly={readOnly} />
        </section>

        {/* Commercial */}
        <section className="space-y-6">
          <SectionHeading
            title="Commercial Terms"
            description="Support, payment and ownership."
          />

          <CommercialTermsCard readOnly={readOnly} />
        </section>
      </div>
    </main>
  );
}
