import { notFound } from "next/navigation";
import ProposalClient from "./ProposalClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProposalPage({ params }: Props) {
  const { slug } = await params;

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const res = await fetch(`${base}/api/proposal/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    notFound();
  }

  const data = await res.json();

  return (
    <ProposalClient
      slug={slug}
      proposal={data.proposal}
      proposalDraft={data.proposalDraft}
      termsVersion={data.termsVersion}
      acceptance={data.acceptance}
    />
  );
}
