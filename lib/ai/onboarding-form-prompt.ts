import { STUDIO_CONTEXT } from "./agency-context";
import type { GenerateOnboardingFormInput } from "@/lib/types/onboarding";

export function buildOnboardingFormPrompt(
  input: GenerateOnboardingFormInput
): string {
  const deliverables = input.deliverables?.length
    ? input.deliverables.map((d) => `- ${d}`).join("\n")
    : "Not specified";

  const techStack = input.techStack?.length
    ? input.techStack.map((t) => `- ${t}`).join("\n")
    : "Not specified";

  const clientResponsibilities = input.clientResponsibilities?.length
    ? input.clientResponsibilities.map((r) => `- ${r}`).join("\n")
    : "Not specified";

  return `
${STUDIO_CONTEXT}

You are an expert full-stack product engineer and studio lead at Zaid Studio.
A client has agreed to a proposal or project, and we need to ONBOARD them efficiently.
Your goal is to generate a comprehensive, intelligent, tailored client onboarding questionnaire.

Analyze this project proposal context thoroughly:
Client Name: ${input.clientName}
Project Type: ${input.projectType}
Summary: ${input.summary || input.description || "Custom web/software development"}

Deliverables:
${deliverables}

Tech Stack:
${techStack}

Client Responsibilities:
${clientResponsibilities}

Timeline: ${input.timeline || "Standard agile sprints"}

INSTRUCTIONS FOR QUESTIONNAIRE GENERATION:
1. Generate between 7 to 12 focused, highly practical questions directly relevant to what is being built.
2. Group the questions into logical categories:
   - "Brand & Design Assets" (Logos, color codes, visual guidelines, Figma links, reference sites)
   - "Technical Access & Credentials" (Domain registrar, DNS access, GitHub, Third-party APIs like Stripe/Supabase/OpenAI if in tech stack)
   - "Content & Core Requirements" (Product copy, imagery, user role definitions, feature specifics)
   - "Project Governance & Sign-off" (Primary decision maker, preferred communication tool, target launch milestones)
3. Choose the most fitting FormFieldType for each question:
   - "text" for short single-line inputs (e.g. domain name, primary contact person)
   - "textarea" for detailed answers (e.g. brand story, specific feature workflows)
   - "url" for website/repository/Figma links
   - "file" for asset uploads or Google Drive / Dropbox shared folders
   - "radio" for single-choice questions (e.g. "Do you already own the domain?", "Preferred communication channel")
   - "checkbox" for multi-select options (e.g. "Which authentication methods should we support?")
   - "select" for dropdown menus
   - "date" for target go-live deadline or milestone dates
4. If a question is "radio", "checkbox", or "select", ALWAYS provide a realistic, comprehensive array of "options".
5. Every field must have:
   - "id": a unique slug identifier (e.g. "brand_vector_logo", "domain_registrar", "stripe_keys")
   - "type": FormFieldType
   - "label": Clear, professional question title
   - "description": Friendly, reassuring explanation of why we need this and what format is expected
   - "placeholder": A realistic example to guide the client
   - "required": boolean (true for essential assets/contacts, false for optional extras)
   - "category": Name of category
6. Provide a welcoming "title" (e.g. "${input.projectType} Onboarding & Discovery") and a friendly, encouraging "description".

Return ONLY valid JSON.
Do not wrap in markdown or backticks.
Do not include any text before or after the JSON.

Expected JSON format:
{
  "title": "Project Onboarding & Kickoff Questionnaire",
  "description": "Welcome to Zaid Studio! Please complete this onboarding form so we can gather the necessary assets, access, and specifications to kick off development without delays.",
  "fields": [
    {
      "id": "brand_logo",
      "type": "file",
      "label": "Brand Logo & Vector Assets",
      "description": "Please provide a shared Google Drive/Dropbox link or vector file for your logo (SVG or high-resolution PNG with transparent background).",
      "placeholder": "https://drive.google.com/drive/folders/...",
      "required": true,
      "category": "Brand & Design Assets"
    }
  ]
}
`;
}
