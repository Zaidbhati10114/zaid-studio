import { callAIWithFallback } from "@/lib/validation/ai-providers";

type GenerateApproachMessageInput = {
    businessName: string;
    businessDetails: string;
    hasWebsite: boolean;
    extraNotes?: string | null;
};

type ApproachMessageResponse = {
    message: string;
};

export async function generateApproachMessage({
    businessName,
    businessDetails,
    hasWebsite,
    extraNotes,
}: GenerateApproachMessageInput) {
    const websiteContext = hasWebsite
        ? `
The business has a website.

You may mention that you can help improve the website's presentation,
user experience, clarity, or customer journey.

Do NOT assume the website is bad, outdated, ineffective, or has specific
problems unless the input explicitly says so.

Do NOT suggest rebuilding the website from scratch unless the input
explicitly supports that.
`
        : `
The business does not have a website.

You may mention helping them establish a strong online presence with
a professional website.
`;

    const prompt = `
You are helping a small web development agency write a short,
personalized first-contact message to a potential business client.

Business name:
${businessName}

Business details:
${businessDetails}

${websiteContext}

Additional notes:
${extraNotes?.trim() || "None"}

Generate one short outreach message.

Requirements:
- Keep it simple, natural, and conversational.
- Maximum 80 words.
- Aim for roughly 3–5 sentences.
- Do not use "Dear Sir/Madam".
- Do not sound corporate, salesy, or generic.
- Clearly communicate what we do: we build professional websites,
  business software, and custom digital solutions for businesses.
- The message must make it obvious that we are a web/software
  development service, not just offering design concepts.
- Naturally connect what we do to the specific business when possible.
- Explain one or two practical ways our work could help this business.
- Mention that we can create 2 design directions/concepts for free.
- The 2 free design concepts are the main reason for the prospect
  to respond and should feel like a useful opportunity, not a gimmick.
- Make it clear there is no commitment or pressure to work together.
- Personalize the message using the provided business information
  when possible.
- Do not invent specific features, services, capabilities, results,
  metrics, or business facts that were not provided.
- Do not claim that a website will increase followers, Instagram reach,
  bookings, sales, conversions, or other measurable results unless
  such a claim is explicitly supported by the provided information.
- When suggesting how a website could help, prefer practical uses such
  as presenting information, showcasing work, explaining services,
  improving customer experience, or making it easier for potential
  customers to contact the business.
- Do not assume specific features such as online booking, payments,
  instant quotes, customer portals, or sign-ups unless the input
  explicitly mentions them.
- Do not mention AI.
- Do not use headings.
- Do not use exaggerated claims.
- Do not add a generic sales CTA after the free design offer unless
  it genuinely improves the message.
- The response must be valid JSON.

Return JSON in exactly this structure:

{
  "message": "the final outreach message"
}

What we do:
- We build professional websites for businesses.
- We build custom business software and digital solutions when useful.
- We help businesses improve their online presence, customer experience,
  and business workflows.

The outreach message must clearly communicate at least one of these services.
`;

    const result = await callAIWithFallback<ApproachMessageResponse>(
        prompt,
        {
            task: "outreach_generation",
        },
    );

    if (
        !result ||
        typeof result !== "object" ||
        typeof result.message !== "string"
    ) {
        throw new Error("AI returned an invalid approach message.");
    }

    const message = result.message.trim();

    if (!message) {
        throw new Error("AI returned an empty approach message.");
    }

    return message;
}