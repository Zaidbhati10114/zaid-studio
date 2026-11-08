import { NextRequest, NextResponse } from "next/server";
import { getOnboardingFormBySlug } from "@/lib/repositories/onboarding";

export async function GET(
  _request: NextRequest,
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
        { error: "This onboarding form has been archived and is no longer accepting responses." },
        { status: 410 }
      );
    }

    // Return sanitized public form
    return NextResponse.json({
      form: {
        id: form.id,
        slug: form.slug,
        client_name: form.client_name,
        client_email: form.client_email,
        project_title: form.project_title,
        title: form.title,
        description: form.description,
        fields: form.fields,
        status: form.status,
      },
    });
  } catch (error) {
    console.error("Public onboarding fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
