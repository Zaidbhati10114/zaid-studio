import emailjs from "@emailjs/browser";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

interface SendQuoteEmailParams {
    toEmail: string;
    clientName: string;
    projectType: string;
    quoteUrl: string;
    summary: string;
    timeline: string;
    cost: string;
}

export async function sendQuoteEmail(params: SendQuoteEmailParams) {
    return emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
            to_email: params.toEmail,
            client_name: params.clientName,
            project_type: params.projectType,
            quote_url: params.quoteUrl,
            summary: params.summary,
            timeline: params.timeline,
            cost: params.cost,
        },
        PUBLIC_KEY
    );
}