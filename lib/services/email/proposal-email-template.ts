interface ProposalEmailTemplateParams {
    clientName: string;

    projectType: string;

    quoteUrl: string;

    estimatedTimeline: string;

    estimatedCost: string;
}


export function createProposalEmailTemplate({
    clientName,
    projectType,
    quoteUrl,
    estimatedTimeline,
    estimatedCost,
}: ProposalEmailTemplateParams) {
    return `
     <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #171717;">
          <div style="margin-bottom: 24px;">
            <p style="font-size: 13px; color: #737373; margin: 0 0 4px;">Zaid Studio</p>
            <h1 style="font-size: 20px; font-weight: 600; margin: 0;">Your Project Proposal is Ready</h1>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #404040;">
            Hi ${clientName}, your proposal for <strong>${projectType ?? "your project"}</strong> is attached as a PDF. You can also view the full interactive version online:
          </p>

          <a
            href="${quoteUrl}"
            style="display: inline-block; margin: 16px 0; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500;"
          >
            View Full Proposal →
          </a>

          <div style="margin-top: 8px; padding: 14px 16px; background: #f5f5f5; border-radius: 8px;">
            <p style="font-size: 12px; color: #737373; margin: 0 0 6px;">Quick summary</p>
            <p style="font-size: 13px; margin: 0 0 4px;"><strong>Timeline:</strong> ${estimatedTimeline ?? "To be confirmed"}</p>
            <p style="font-size: 13px; margin: 0;"><strong>Estimate:</strong> ${estimatedCost ?? "To be confirmed"}</p>
          </div>

          <p style="font-size: 13px; color: #404040; margin-top: 20px; line-height: 1.6;">
            Want to discuss this?
            <a href="https://wa.me/919503148821" style="color: #2563eb;">Chat on WhatsApp</a>
            or reply to this email — happy to walk you through it.
          </p>

          <p style="font-size: 12px; color: #a3a3a3; margin-top: 24px; border-top: 1px solid #e5e5e5; padding-top: 16px;">
            Zaid Studio · zaidstudio.vercel.app
          </p>
        </div>
  `;
}