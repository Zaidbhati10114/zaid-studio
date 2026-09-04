import { buildProposalPrompt } from "./proposal-prompt";

import type { ProposalGenerationInput } from "@/lib/types";
import type { ProposalDraft } from "./proposal-schema";
import { AGENCY_DEFAULTS } from "./agency-defaults";
import { callAIWithFallback } from "../validation/ai-providers";


export async function generateProposal(
    input: ProposalGenerationInput
): Promise<ProposalDraft> {
    const prompt = buildProposalPrompt(input);

    const proposal = await callAIWithFallback<ProposalDraft>(prompt, {
        task: "proposal_generation",
    });

    return {
        ...proposal,

        supportPolicy: AGENCY_DEFAULTS.supportPolicy,
        paymentTerms: AGENCY_DEFAULTS.paymentTerms,
        ownershipTerms: AGENCY_DEFAULTS.ownershipTerms,
    };
}