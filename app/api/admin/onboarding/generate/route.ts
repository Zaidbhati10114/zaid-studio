import { NextRequest, NextResponse } from "next/server";
import { generateOnboardingForm } from "@/lib/ai/onboarding-form-generator";
import { getQuoteById } from "@/lib/repositories/quotes";
import { getProposalDraft } from "@/lib/repositories/proposal-drafts";
import { dbToProposalDraft } from "@/lib/mappers/proposal-draft";
import { saveOnboardingForm } from "@/lib/repositories/onboarding";
import type { GenerateOnboardingFormInput } from "@/lib/types/onboarding";

function isAuthed(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return true;
  const cookie = request.cookies.get("admin_session");
  return cookie?.value === adminPassword;
}

export async function POST(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { quoteId, save = false, customContext } = body;

    let input: GenerateOnboardingFormInput;

    if (quoteId) {
      const quote = await getQuoteById(quoteId);
      if (!quote) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
      }

      const draftDb = await getProposalDraft(quoteId);
      const draft = draftDb ? dbToProposalDraft(draftDb) : null;

      input = {
        quoteId,
        clientName: quote.name,
        clientEmail: quote.email,
        projectType: quote.project_type,
        description: quote.description,
        summary: draft?.summary || quote.summary,
        deliverables: draft?.deliverables || quote.deliverables || [],
        techStack: draft?.techStack || quote.tech_stack || [],
        phases: (draft?.phases as Array<{ name: string; duration?: string; tasks?: string[] }>) || (quote.phases as Array<{ name: string; duration?: string; tasks?: string[] }>) || [],
        clientResponsibilities:
          draft?.clientResponsibilities || quote.client_responsibilities || [],
        timeline: draft?.estimatedTimeline || quote.estimated_timeline,
      };
    } else {
      input = {
        clientName: body.clientName || "Valued Client",
        clientEmail: body.clientEmail,
        projectType: body.projectType || "Web Application",
        description: body.description || customContext || "",
        summary: body.summary || "",
        deliverables: body.deliverables || [],
        techStack: body.techStack || [],
        phases: body.phases || [],
        clientResponsibilities: body.clientResponsibilities || [],
        timeline: body.timeline || "",
      };
    }

    const generated = await generateOnboardingForm(input);

    if (save) {
      const newForm = await saveOnboardingForm({
        quote_id: input.quoteId || null,
        client_name: input.clientName,
        client_email: input.clientEmail || null,
        project_title: `${input.projectType} for ${input.clientName}`,
        title: generated.title,
        description: generated.description,
        fields: generated.fields,
        status: "published",
      });

      return NextResponse.json({
        success: true,
        generated,
        form: newForm,
      });
    }

    return NextResponse.json({
      success: true,
      generated,
    });
  } catch (error) {
    console.error("AI Onboarding generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate onboarding form",
      },
      { status: 500 }
    );
  }
}
