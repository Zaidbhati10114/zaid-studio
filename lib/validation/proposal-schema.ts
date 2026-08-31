import * as z from "zod";

export const proposalFormSchema = z.object({
    summary: z
        .string()
        .min(20, "Summary should be at least 20 characters."),

    estimatedTimeline: z
        .string()
        .min(1, "Timeline is required."),

    estimatedCost: z
        .string()
        .min(1, "Estimated cost is required."),

    complexity: z.enum([
        "Simple",
        "Medium",
        "Complex",
    ]),

    deliverables: z.array(z.string()),

    techStack: z.array(z.string()),

    phases: z.array(
        z.object({
            name: z.string(),
            duration: z.string(),
            tasks: z.array(z.string()),
        })
    ),

    clientResponsibilities: z.array(z.string()),

    risks: z.array(
        z.object({
            risk: z.string(),
            mitigation: z.string(),
        })
    ),

    nextSteps: z.array(z.string()),
    supportPolicy: z
        .string()
        .min(1, "Support policy is required."),

    paymentTerms: z
        .string()
        .min(1, "Payment terms are required."),

    ownershipTerms: z
        .string()
        .min(1, "Ownership terms are required."),

});

export type ProposalForm = z.infer<typeof proposalFormSchema>;