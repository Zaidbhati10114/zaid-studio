export const PROPOSAL_STATUS = {
    DRAFT: "draft",
    AWAITING_CLIENT: "awaiting_client",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
} as const;

export type ProposalStatus =
    (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS];