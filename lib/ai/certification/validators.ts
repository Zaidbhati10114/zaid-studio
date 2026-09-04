export function validateQuote(projectQuote: any): boolean {
    if (!projectQuote || typeof projectQuote !== "object") return false;

    return (
        typeof projectQuote.projectName === "string" &&
        Array.isArray(projectQuote.projectScope) &&
        projectQuote.projectScope.length > 0 &&
        typeof projectQuote.summary?.totalAmount === "number" &&
        typeof projectQuote.timeline?.duration === "string"
    );
}

export function validateProposal(proposal: any): boolean {
    if (!proposal || typeof proposal !== "object") return false;

    return (
        typeof proposal.summary === "string" &&
        typeof proposal.estimatedTimeline === "string" &&
        typeof proposal.estimatedCost === "string" &&
        Array.isArray(proposal.deliverables) &&
        Array.isArray(proposal.techStack) &&
        Array.isArray(proposal.phases) &&
        Array.isArray(proposal.risks) &&
        Array.isArray(proposal.nextSteps)
    );
}