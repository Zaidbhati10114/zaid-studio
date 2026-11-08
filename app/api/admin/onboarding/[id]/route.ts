import { NextRequest, NextResponse } from "next/server";
import {
  getOnboardingFormById,
  saveOnboardingForm,
  deleteOnboardingForm,
} from "@/lib/repositories/onboarding";

function isAuthed(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return true;
  const cookie = request.cookies.get("admin_session");
  return cookie?.value === adminPassword;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const form = await getOnboardingFormById(id);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    return NextResponse.json({ form });
  } catch (error) {
    console.error("Failed to get onboarding form:", error);
    return NextResponse.json(
      { error: "Failed to get onboarding form" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const existing = await getOnboardingFormById(id);
    if (!existing) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const updated = await saveOnboardingForm({
      ...existing,
      ...body,
      id,
    });

    return NextResponse.json({ form: updated });
  } catch (error) {
    console.error("Failed to update onboarding form:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding form" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await deleteOnboardingForm(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete onboarding form:", error);
    return NextResponse.json(
      { error: "Failed to delete onboarding form" },
      { status: 500 }
    );
  }
}
