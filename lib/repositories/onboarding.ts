import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase-server";
import type {
  OnboardingForm,
  OnboardingSubmission,
  FormField,
} from "@/lib/types/onboarding";

const DATA_DIR = path.join(process.cwd(), "data");
const FORMS_FILE = path.join(DATA_DIR, "onboarding-forms.json");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "onboarding-submissions.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readLocalForms(): OnboardingForm[] {
  ensureDirectoryExists();
  if (!fs.existsSync(FORMS_FILE)) return [];
  try {
    const raw = fs.readFileSync(FORMS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalForms(forms: OnboardingForm[]) {
  ensureDirectoryExists();
  fs.writeFileSync(FORMS_FILE, JSON.stringify(forms, null, 2), "utf-8");
}

function readLocalSubmissions(): OnboardingSubmission[] {
  ensureDirectoryExists();
  if (!fs.existsSync(SUBMISSIONS_FILE)) return [];
  try {
    const raw = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalSubmissions(subs: OnboardingSubmission[]) {
  ensureDirectoryExists();
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(subs, null, 2), "utf-8");
}

export function generateSlug(clientName: string, projectTitle: string): string {
  const cleanClient = clientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const cleanProject = projectTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const rand = Math.random().toString(36).substring(2, 7);
  return `onboard-${cleanClient || "client"}-${cleanProject || "project"}-${rand}`;
}

export async function listOnboardingForms(): Promise<OnboardingForm[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("onboarding_forms")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Get submission counts
      const forms = data as OnboardingForm[];
      const { data: subCounts } = await supabaseAdmin
        .from("onboarding_submissions")
        .select("form_id");

      const countMap: Record<string, number> = {};
      if (subCounts) {
        for (const item of subCounts) {
          countMap[item.form_id] = (countMap[item.form_id] || 0) + 1;
        }
      }

      return forms.map((f) => ({
        ...f,
        submissions_count: countMap[f.id] || 0,
      }));
    }
  } catch {
    // fallback to local file
  }

  const localForms = readLocalForms();
  const localSubs = readLocalSubmissions();
  return localForms.map((f) => ({
    ...f,
    submissions_count: localSubs.filter((s) => s.form_id === f.id).length,
  }));
}

export async function getOnboardingFormById(
  id: string
): Promise<OnboardingForm | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("onboarding_forms")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return data as OnboardingForm;
    }
  } catch {
    // fallback
  }

  const forms = readLocalForms();
  return forms.find((f) => f.id === id) || null;
}

export async function getOnboardingFormBySlug(
  slug: string
): Promise<OnboardingForm | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("onboarding_forms")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      return data as OnboardingForm;
    }
  } catch {
    // fallback
  }

  const forms = readLocalForms();
  return forms.find((f) => f.slug === slug) || null;
}

export async function getOnboardingFormByQuoteId(
  quoteId: string
): Promise<OnboardingForm | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("onboarding_forms")
      .select("*")
      .eq("quote_id", quoteId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return data as OnboardingForm;
    }
  } catch {
    // fallback
  }

  const forms = readLocalForms();
  return forms.find((f) => f.quote_id === quoteId) || null;
}

export async function saveOnboardingForm(
  payload: Partial<OnboardingForm> & {
    client_name: string;
    project_title: string;
    fields: FormField[];
  }
): Promise<OnboardingForm> {
  const now = new Date().toISOString();
  const id = payload.id || crypto.randomUUID();
  const slug =
    payload.slug || generateSlug(payload.client_name, payload.project_title);

  const formRecord: OnboardingForm = {
    id,
    slug,
    quote_id: payload.quote_id || null,
    proposal_id: payload.proposal_id || null,
    client_name: payload.client_name,
    client_email: payload.client_email || null,
    project_title: payload.project_title,
    title: payload.title || `${payload.project_title} Onboarding`,
    description: payload.description || "",
    fields: payload.fields,
    status: payload.status || "published",
    created_at: payload.created_at || now,
    updated_at: now,
  };

  // Try Supabase first
  try {
    const { data: existing } = await supabaseAdmin
      .from("onboarding_forms")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("onboarding_forms")
        .update({
          title: formRecord.title,
          description: formRecord.description,
          fields: formRecord.fields,
          status: formRecord.status,
          updated_at: now,
        })
        .eq("id", id);
    } else {
      await supabaseAdmin.from("onboarding_forms").insert({
        id: formRecord.id,
        slug: formRecord.slug,
        quote_id: formRecord.quote_id,
        proposal_id: formRecord.proposal_id,
        client_name: formRecord.client_name,
        client_email: formRecord.client_email,
        project_title: formRecord.project_title,
        title: formRecord.title,
        description: formRecord.description,
        fields: formRecord.fields,
        status: formRecord.status,
        created_at: formRecord.created_at,
        updated_at: formRecord.updated_at,
      });
    }
  } catch {
    // fall through to local file
  }

  // Always keep local file synced
  const localForms = readLocalForms();
  const existingIdx = localForms.findIndex((f) => f.id === id);
  if (existingIdx >= 0) {
    localForms[existingIdx] = formRecord;
  } else {
    localForms.unshift(formRecord);
  }
  writeLocalForms(localForms);

  return formRecord;
}

export async function deleteOnboardingForm(id: string): Promise<boolean> {
  try {
    await supabaseAdmin.from("onboarding_forms").delete().eq("id", id);
  } catch {
    // ignore
  }

  const localForms = readLocalForms().filter((f) => f.id !== id);
  writeLocalForms(localForms);
  return true;
}

export async function saveOnboardingSubmission(
  payload: Omit<OnboardingSubmission, "id" | "submitted_at" | "status">
): Promise<OnboardingSubmission> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const submission: OnboardingSubmission = {
    id,
    form_id: payload.form_id,
    form_slug: payload.form_slug,
    client_name: payload.client_name,
    client_email: payload.client_email,
    answers: payload.answers,
    status: "submitted",
    notes: null,
    submitted_at: now,
    user_agent: payload.user_agent,
    ip_address: payload.ip_address,
  };

  try {
    await supabaseAdmin.from("onboarding_submissions").insert({
      id: submission.id,
      form_id: submission.form_id,
      form_slug: submission.form_slug,
      client_name: submission.client_name,
      client_email: submission.client_email,
      answers: submission.answers,
      status: submission.status,
      notes: submission.notes,
      submitted_at: submission.submitted_at,
      user_agent: submission.user_agent,
      ip_address: submission.ip_address,
    });
  } catch {
    // fallback
  }

  const localSubs = readLocalSubmissions();
  localSubs.unshift(submission);
  writeLocalSubmissions(localSubs);

  return submission;
}

export async function getSubmissionsByFormId(
  formId: string
): Promise<OnboardingSubmission[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("onboarding_submissions")
      .select("*")
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false });

    if (!error && data) {
      return data as OnboardingSubmission[];
    }
  } catch {
    // fallback
  }

  const localSubs = readLocalSubmissions();
  return localSubs.filter((s) => s.form_id === formId);
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: "submitted" | "reviewed",
  notes?: string
): Promise<boolean> {
  try {
    const updatePayload: { status: string; notes?: string } = { status };
    if (notes !== undefined) updatePayload.notes = notes;

    await supabaseAdmin
      .from("onboarding_submissions")
      .update(updatePayload)
      .eq("id", submissionId);
  } catch {
    // fallback
  }

  const localSubs = readLocalSubmissions();
  const target = localSubs.find((s) => s.id === submissionId);
  if (target) {
    target.status = status;
    if (notes !== undefined) target.notes = notes;
    writeLocalSubmissions(localSubs);
  }
  return true;
}
