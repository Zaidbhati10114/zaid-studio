import { NextRequest, NextResponse } from "next/server";
import {
  getOnboardingFormByQuoteId,
  saveOnboardingForm,
} from "@/lib/repositories/onboarding";
import { getQuoteById } from "@/lib/repositories/quotes";
import { getProposalDraft } from "@/lib/repositories/proposal-drafts";
import { dbToProposalDraft } from "@/lib/mappers/proposal-draft";
import { generateOnboardingForm } from "@/lib/ai/onboarding-form-generator";

function isAuthed(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return true;
  const cookie = request.cookies.get("admin_session");
  return cookie?.value === adminPassword;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quoteId } = await params;

  try {
    const existing = await getOnboardingFormByQuoteId(quoteId);
    if (existing) {
      return NextResponse.json({ form: existing });
    }

    // If no onboarding form exists yet, generate one from the proposal context
    const quote = await getQuoteById(quoteId);
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const draftDb = await getProposalDraft(quoteId);
    const draft = draftDb ? dbToProposalDraft(draftDb) : null;

    const generated = await generateOnboardingForm({
      quoteId,
      clientName: quote.name,
      clientEmail: quote.email,
      projectType: quote.project_type,
      description: quote.description,
      summary: draft?.summary || quote.summary,
      deliverables: draft?.deliverables || quote.deliverables || [],
      techStack: draft?.techStack || quote.tech_stack || [],
      clientResponsibilities:
        draft?.clientResponsibilities || quote.client_responsibilities || [],
      timeline: draft?.estimatedTimeline || quote.estimated_timeline,
    });

    const newForm = await saveOnboardingForm({
      quote_id: quoteId,
      client_name: quote.name,
      client_email: quote.email,
      project_title: `${quote.project_type} for ${quote.name}`,
      title: generated.title,
      description: generated.description,
      fields: generated.fields,
      status: "published",
    });

    return NextResponse.json({ form: newForm, generated: true });
  } catch (error) {
    console.error("Failed to get/generate onboarding form by quote:", error);
    return NextResponse.json(
      { error: "Failed to load onboarding form" },
      { status: 500 }
    );
  }
}
