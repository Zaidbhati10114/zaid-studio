import { NextRequest, NextResponse } from "next/server";
import {
  getOnboardingFormBySlug,
  saveOnboardingSubmission,
} from "@/lib/repositories/onboarding";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const form = await getOnboardingFormBySlug(slug);

    if (!form) {
      return NextResponse.json({ error: "Onboarding form not found." }, { status: 404 });
    }

    if (form.status === "archived") {
      return NextResponse.json(
        { error: "This onboarding form is closed." },
        { status: 410 }
      );
    }

    const body = await request.json();
    const { answers, client_name, client_email } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid answers payload." },
        { status: 400 }
      );
    }

    // Verify required fields
    for (const field of form.fields) {
      if (field.required && field.type !== "section_header") {
        const val = answers[field.id];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          return NextResponse.json(
            { error: `"${field.label}" is required.` },
            { status: 400 }
          );
        }
      }
    }

    const submission = await saveOnboardingSubmission({
      form_id: form.id,
      form_slug: form.slug,
      client_name: client_name || form.client_name,
      client_email: client_email || form.client_email,
      answers,
      user_agent: request.headers.get("user-agent") || null,
      ip_address:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        null,
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      submittedAt: submission.submitted_at,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit onboarding form. Please try again." },
      { status: 500 }
    );
  }
}
