import { NextRequest, NextResponse } from "next/server";
import {
  getSubmissionsByFormId,
  updateSubmissionStatus,
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
    const submissions = await getSubmissionsByFormId(id);
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Failed to load submissions:", error);
    return NextResponse.json(
      { error: "Failed to load submissions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // We have form id in params, submissionId in body
  try {
    const body = await request.json();
    const { submissionId, status, notes } = body;

    if (!submissionId || !status) {
      return NextResponse.json(
        { error: "Missing submissionId or status" },
        { status: 400 }
      );
    }

    await updateSubmissionStatus(submissionId, status, notes);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}
