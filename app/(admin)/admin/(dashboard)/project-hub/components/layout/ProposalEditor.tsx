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
// Temporary placeholders
// import { TechStackCard } from "../cards/TechStackCard";
// import { PhasesCard } from "../cards/PhasesCard";
// import { ResponsibilitiesCard } from "../cards/ResponsibilitiesCard";
// import { RisksCard } from "../cards/RisksCard";
// import { NextStepsCard } from "../cards/NextStepsCard";
// import { CommercialTermsCard } from "../cards/CommercialTermsCard";

const sections = [SummaryCard, TimelineCard, CostCard, DeliverablesCard];

export function ProposalEditor() {
  return (
    <main className="flex-1 overflow-y-auto bg-muted/20">
      <div className="mx-auto max-w-6xl space-y-12 p-8">
        {/* Overview */}

        <section className="space-y-6">
          <SectionHeading
            title="Overview"
            description="High-level project summary and commercial estimate."
          />

          <SummaryCard />

          <div className="grid gap-6 lg:grid-cols-2">
            <TimelineCard />
            <CostCard />
          </div>
        </section>

        {/* Scope */}

        <section className="space-y-6">
          <SectionHeading
            title="Project Scope"
            description="Everything included in this proposal."
          />

          <DeliverablesCard />

          {/* TechStackCard */}
          <TechStackCard />
        </section>

        {/* Execution */}

        <section className="space-y-6">
          <SectionHeading
            title="Execution"
            description="How the project will be delivered."
          />

          {/* PhasesCard */}
          <PhasesCard />

          {/* ResponsibilitiesCard */}
          <ClientResponsibilitiesCard />
        </section>

        {/* Delivery */}

        <section className="space-y-6">
          <SectionHeading
            title="Delivery"
            description="Project risks and next steps."
          />

          {/* RisksCard */}
          <RisksCard />

          {/* NextStepsCard */}
          <NextStepsCard />
        </section>

        {/* Commercial */}

        <section className="space-y-6">
          <SectionHeading
            title="Commercial Terms"
            description="Support, payment and ownership."
          />

          {/* CommercialTermsCard */}
          <CommercialTermsCard />
        </section>
      </div>
    </main>
  );
}
