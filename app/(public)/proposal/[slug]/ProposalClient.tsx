"use client";

import { useState } from "react";
import Hero from "./components/Hero";
import SummaryCards from "./components/SummaryCards";
import TermsCard from "./components/TermsCard";
import AcceptanceForm from "./components/AcceptanceForm";
import SuccessState from "./components/SuccessState";

interface Props {
  slug: string;
  proposal: any;
  proposalDraft: any;
  termsVersion: string;
  acceptance: {
    accepted: boolean;
    acceptedAt?: string;
    acceptedBy?: string;
  };
}

export default function ProposalClient({
  slug,
  proposal,
  proposalDraft,
  termsVersion,
  acceptance,
}: Props) {
  const [accepted, setAccepted] = useState(acceptance.accepted);
  const [acceptedAt, setAcceptedAt] = useState(acceptance.acceptedAt ?? "");

  if (accepted) {
    return <SuccessState acceptedAt={acceptedAt} />;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 pt-28 pb-10 space-y-8">
      <Hero proposal={proposal} />

      <SummaryCards proposal={proposalDraft} />

      <TermsCard proposal={proposalDraft} termsVersion={termsVersion} />

      <div className="scroll-mt-24" id="approval">
        <AcceptanceForm
          slug={slug}
          onAccepted={(acceptedTime) => {
            setAccepted(true);
            setAcceptedAt(acceptedTime);
          }}
        />
      </div>
    </main>
  );
}
