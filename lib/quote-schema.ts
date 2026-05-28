import { z } from "zod";

export const quoteSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Please enter your name"),

    email: z
        .string()
        .trim()
        .email("Enter a valid email address"),

    projectType: z
        .string()
        .min(1, "Select a project type"),

    stage: z
        .string()
        .min(1, "Select your current stage"),

    budget: z.string().optional(),

    timeline: z
        .string()
        .min(1, "Select a timeline"),

    description: z
        .string()
        .trim()
        .min(15, "Please describe your project").refine((val) => {
            return /[a-zA-Z]/.test(val);
        }, {
            message: "Project description must contain real words"
        }).refine((val) => {
            const words = val
                .trim()
                .split(/\s+/)
                .filter((w) => w.length > 1);

            return words.length >= 5;
        }, {
            message:
                "Please provide a few more details about your project",
        })

        .refine((val) => {
            const words = val
                .trim()
                .split(/\s+/)
                .filter((w) => w.length > 1);

            const unique = new Set(
                words.map((w) => w.toLowerCase()),
            );

            return unique.size >= 4;
        }, {
            message:
                "Please use meaningful words to describe your project",
        })




});

export type QuoteFormValues = z.infer<
    typeof quoteSchema
>;