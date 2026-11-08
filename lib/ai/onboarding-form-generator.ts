import { buildOnboardingFormPrompt } from "./onboarding-form-prompt";
import { callAIWithFallback } from "../validation/ai-providers";
import type {
  GenerateOnboardingFormInput,
  GenerateOnboardingFormResponse,
  FormField,
} from "@/lib/types/onboarding";

export function getDefaultOnboardingForm(
  input: GenerateOnboardingFormInput
): GenerateOnboardingFormResponse {
  const isEcommerce =
    input.projectType.toLowerCase().includes("commerce") ||
    input.description?.toLowerCase().includes("shop") ||
    input.deliverables?.some((d) => d.toLowerCase().includes("stripe"));

  const hasAuth =
    input.deliverables?.some((d) =>
      d.toLowerCase().includes("auth") || d.toLowerCase().includes("user")
    ) || input.techStack?.some((t) => t.toLowerCase().includes("supabase"));

  const fields: FormField[] = [
    {
      id: "brand_logo_assets",
      type: "file",
      label: "Brand Logo & Vector Files",
      description:
        "Please provide a link to your primary logo files (preferably SVG or high-resolution PNG with transparent background) and brand assets.",
      placeholder: "https://drive.google.com/drive/folders/...",
      required: true,
      category: "Brand & Design Assets",
    },
    {
      id: "brand_colors_fonts",
      type: "textarea",
      label: "Brand Colors, Fonts & Visual Guidelines",
      description:
        "Do you have established brand colors (HEX codes) or typography guidelines? If not, tell us the vibe or aesthetic you want to convey.",
      placeholder: "Primary: #0066FF, Accent: #10B981. Font: Inter or Geist Sans. Clean modern tech aesthetic.",
      required: false,
      category: "Brand & Design Assets",
    },
    {
      id: "inspiration_websites",
      type: "textarea",
      label: "Reference & Competitor Websites You Like",
      description:
        "Share 2–3 links to websites or products whose design, animations, or layout you admire, with notes on what you like about them.",
      placeholder: "https://linear.app - love the clean typography and dark mode; https://stripe.com - clean checkout flow",
      required: false,
      category: "Brand & Design Assets",
    },
    {
      id: "domain_status",
      type: "radio",
      label: "Do you already own the target domain name?",
      description:
        "Let us know if you already purchased your domain or need guidance registering one.",
      required: true,
      options: [
        "Yes, domain is already purchased",
        "No, we need to purchase one",
        "We will use a staging/subdomain for now",
      ],
      category: "Technical Access & Credentials",
    },
    {
      id: "domain_registrar",
      type: "text",
      label: "Domain Name & Registrar",
      description:
        "If you already own the domain, what is the domain name and which registrar do you use (Cloudflare, GoDaddy, Namecheap, etc.)?",
      placeholder: "mybrand.com on Cloudflare",
      required: false,
      category: "Technical Access & Credentials",
    },
  ];

  if (hasAuth) {
    fields.push({
      id: "auth_methods",
      type: "checkbox",
      label: "User Authentication & Sign-in Methods",
      description:
        "Which login options should we enable for your users in this version?",
      required: true,
      options: [
        "Email & Password",
        "Magic Link / Passwordless Email",
        "Google OAuth",
        "GitHub OAuth",
        "Phone / SMS OTP",
      ],
      category: "Technical Access & Credentials",
    });
  }

  if (isEcommerce) {
    fields.push({
      id: "payment_currency",
      type: "select",
      label: "Primary Currency & Payment Processor",
      description:
        "Which currency will your store transact in primarily?",
      required: true,
      options: ["INR (₹)", "USD ($)", "EUR (€)", "GBP (£)", "Multi-Currency"],
      category: "Technical Access & Credentials",
    });
    fields.push({
      id: "stripe_readiness",
      type: "radio",
      label: "Payment Gateway Account Status",
      description:
        "Do you have an active Stripe or Razorpay business account ready?",
      required: true,
      options: [
        "Yes, Stripe account is verified and ready",
        "Yes, Razorpay account is ready",
        "Need help setting up a payment account",
      ],
      category: "Technical Access & Credentials",
    });
  }

  fields.push(
    {
      id: "content_copywriting",
      type: "textarea",
      label: "Content, Copywriting & Media Assets",
      description:
        "Do you have ready copywriting, product descriptions, or photography? Provide links to Google Docs/Sheets or describe current status.",
      placeholder: "https://docs.google.com/document/d/... or 'We will provide final copy during Phase 2'",
      required: false,
      category: "Content & Core Requirements",
    },
    {
      id: "key_success_metric",
      type: "textarea",
      label: "Key Project Success Metric / Goal",
      description:
        "What is the single most important metric or outcome for this launch (e.g. increase lead conversions by 30%, launch MVP in 4 weeks)?",
      placeholder: "Launch MVP to first 100 beta customers and collect feedback smoothly.",
      required: true,
      category: "Content & Core Requirements",
    },
    {
      id: "primary_contact",
      type: "text",
      label: "Primary Decision Maker & Approver",
      description:
        "Name and phone/email of the primary stakeholder responsible for sprint reviews and milestone sign-offs.",
      placeholder: `${input.clientName} (Founder/Lead)`,
      required: true,
      category: "Project Governance & Sign-off",
    },
    {
      id: "preferred_communication",
      type: "radio",
      label: "Preferred Communication Channel",
      description:
        "Where should we send day-to-day sprint updates, staging previews, and quick questions?",
      required: true,
      options: [
        "Dedicated Slack Channel",
        "WhatsApp Group",
        "Discord",
        "Email Updates & Weekly Calls",
      ],
      category: "Project Governance & Sign-off",
    },
    {
      id: "target_launch_date",
      type: "date",
      label: "Target Go-Live / Launch Date",
      description:
        "Is there a specific hard deadline, product launch event, or marketing campaign we should align with?",
      required: false,
      category: "Project Governance & Sign-off",
    }
  );

  return {
    title: `${input.projectType} Client Onboarding`,
    description: `Welcome to Zaid Studio! We are excited to collaborate on ${input.clientName}'s ${input.projectType}. Please complete this onboarding form so we have all necessary credentials, brand assets, and technical requirements before kicking off development.`,
    fields,
  };
}

export async function generateOnboardingForm(
  input: GenerateOnboardingFormInput
): Promise<GenerateOnboardingFormResponse> {
  const prompt = buildOnboardingFormPrompt(input);

  try {
    const response = await callAIWithFallback<GenerateOnboardingFormResponse>(
      prompt,
      {
        task: "proposal_generation",
      }
    );

    if (
      response &&
      response.fields &&
      Array.isArray(response.fields) &&
      response.fields.length > 0
    ) {
      // Ensure all fields have valid structure
      const validatedFields: FormField[] = response.fields.map(
        (field, index) => ({
          id: field.id || `field_${index + 1}_${Date.now().toString(36)}`,
          type: field.type || "text",
          label: field.label || `Question ${index + 1}`,
          placeholder: field.placeholder || "",
          description: field.description || "",
          required: Boolean(field.required),
          options: Array.isArray(field.options) ? field.options : undefined,
          category: field.category || "General Requirements",
        })
      );

      return {
        title: response.title || `${input.projectType} Onboarding`,
        description:
          response.description ||
          "Please answer the questions below to help us kick off your project smoothly.",
        fields: validatedFields,
      };
    }

    return getDefaultOnboardingForm(input);
  } catch (error) {
    console.warn("AI Onboarding generation failed, falling back to heuristic template:", error);
    return getDefaultOnboardingForm(input);
  }
}
