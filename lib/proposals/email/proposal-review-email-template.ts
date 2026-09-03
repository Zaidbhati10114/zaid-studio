interface ProposalReviewEmailTemplateParams {
    clientName: string;
    projectType: string;
    proposalUrl: string;
    estimatedTimeline: string;
    estimatedCost: string;
}

export function createProposalReviewEmailTemplate({
    clientName,
    projectType,
    proposalUrl,
    estimatedTimeline,
    estimatedCost,
}: ProposalReviewEmailTemplateParams) {
    return `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #171717;">

      <div style="margin-bottom: 24px;">
        <p style="font-size: 13px; color: #737373; margin: 0 0 4px;">
          Zaid Studio
        </p>

        <h1 style="font-size: 20px; font-weight: 600; margin: 0;">
          Your Project Proposal is Ready
        </h1>
      </div>

      <p style="font-size: 14px; line-height: 1.7; color: #404040;">
        Hi <strong>${clientName}</strong>,
      </p>

      <p style="font-size: 14px; line-height: 1.7; color: #404040;">
        Your proposal for <strong>${projectType ?? "your project"}</strong> is ready for review.
      </p>

      <p style="font-size: 14px; line-height: 1.7; color: #404040;">
        Please take a few minutes to review the project scope, timeline, investment, and terms before accepting. Once you're happy with everything, you can digitally approve it to begin the project.
      </p>

      <a
        href="${proposalUrl}"
        style="display:inline-block;margin:20px 0;background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-size:14px;font-weight:600;"
      >
        Review Proposal →
      </a>

      <div style="margin-top:8px;padding:16px;background:#f5f5f5;border-radius:10px;">
        <p style="font-size:12px;color:#737373;margin:0 0 8px;">
          Quick summary
        </p>

        <p style="font-size:13px;margin:0 0 6px;">
          <strong>Timeline:</strong> ${estimatedTimeline ?? "To be confirmed"}
        </p>

        <p style="font-size:13px;margin:0;">
          <strong>Investment:</strong> ${estimatedCost ?? "To be confirmed"}
        </p>
      </div>

      <div style="margin-top:24px;padding:16px;border:1px solid #e5e5e5;border-radius:10px;">
        <p style="font-size:13px;font-weight:600;margin:0 0 8px;">
          What happens next?
        </p>

        <p style="font-size:13px;color:#525252;line-height:1.7;margin:0;">
          • Review the proposal online.<br>
          • Read the Terms & Conditions.<br>
          • Enter your name and digitally accept.<br>
          • We'll confirm the project kickoff.
        </p>
      </div>

      <p style="font-size:13px;color:#404040;margin-top:24px;line-height:1.7;">
        Have questions?
        <a href="https://wa.me/919503148821" style="color:#2563eb;">
          Chat on WhatsApp
        </a>
        or simply reply to this email.
      </p>

      <p style="font-size:12px;color:#a3a3a3;margin-top:28px;border-top:1px solid #e5e5e5;padding-top:16px;">
        Zaid Studio · zaidstudio.vercel.app
      </p>

    </div>
  `;
}