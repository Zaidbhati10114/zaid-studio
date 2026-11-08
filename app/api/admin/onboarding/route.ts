import { NextRequest, NextResponse } from "next/server";
import {
  listOnboardingForms,
  saveOnboardingForm,
} from "@/lib/repositories/onboarding";

function isAuthed(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return true; // dev mode
  const cookie = request.cookies.get("admin_session");
  return cookie?.value === adminPassword;
}

export async function GET(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const forms = await listOnboardingForms();
    return NextResponse.json({ forms });
  } catch (error) {
    console.error("Failed to list onboarding forms:", error);
    return NextResponse.json(
      { error: "Failed to load onboarding forms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { client_name, project_title, fields } = body;

    if (!client_name || !project_title || !Array.isArray(fields)) {
      return NextResponse.json(
        { error: "Missing required fields: client_name, project_title, fields" },
        { status: 400 }
      );
    }

    const saved = await saveOnboardingForm(body);
    return NextResponse.json({ form: saved });
  } catch (error) {
    console.error("Failed to save onboarding form:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding form" },
      { status: 500 }
    );
  }
}
