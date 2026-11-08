export type FormFieldType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "url"
  | "file"
  | "date"
  | "number"
  | "section_header";

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  options?: string[];
  category?: string;
}

export interface OnboardingForm {
  id: string;
  slug: string;
  quote_id?: string | null;
  proposal_id?: string | null;
  client_name: string;
  client_email?: string | null;
  project_title: string;
  title: string;
  description: string;
  fields: FormField[];
  status: "draft" | "published" | "completed" | "archived";
  created_at: string;
  updated_at: string;
  submissions_count?: number;
}

export interface OnboardingSubmission {
  id: string;
  form_id: string;
  form_slug: string;
  client_name: string;
  client_email?: string;
  answers: Record<string, string | string[] | number | boolean>;
  status: "submitted" | "reviewed";
  notes?: string | null;
  submitted_at: string;
  user_agent?: string | null;
  ip_address?: string | null;
}

export interface GenerateOnboardingFormInput {
  quoteId?: string;
  clientName: string;
  clientEmail?: string;
  projectType: string;
  description?: string;
  summary?: string;
  deliverables?: string[];
  techStack?: string[];
  phases?: { name: string; duration?: string; tasks?: string[] }[];
  clientResponsibilities?: string[];
  timeline?: string;
}

export interface GenerateOnboardingFormResponse {
  title: string;
  description: string;
  fields: FormField[];
}
