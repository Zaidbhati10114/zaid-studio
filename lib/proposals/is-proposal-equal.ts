import type { ProposalDraft } from "@/lib/ai/proposal-schema";

export function isProposalEqual(
    a: ProposalDraft,
    b: ProposalDraft
) {
    return JSON.stringify(a) === JSON.stringify(b);
}