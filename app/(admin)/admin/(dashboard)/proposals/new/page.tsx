"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  useCreateAdminProposal,
  type AdminCreateProposalRequest,
} from "@/hooks/useProposal";
const projectTypes = [
  "Website",
  "Web App",
  "E-commerce",
  "Mobile App",
  "API/Backend",
  "SaaS Product",
  "Other",
];

const stages = [
  "Starting from scratch",
  "I have a basic website",
  "Need redesign",
  "Need advanced features",
];

const timelines = ["ASAP", "2–4 weeks", "1–2 months", "Flexible"];
const ADMIN_PROPOSAL_FORM_STORAGE_KEY = "admin-create-proposal-form";

const budgets = ["Under ₹50k", "₹50k – ₹1L", "₹1L – ₹3L", "₹3L+", "Not sure"];

export default function AdminCreateProposalPage() {
  const router = useRouter();

  const emptyForm: AdminCreateProposalRequest = {
    name: "",
    email: "",
    projectType: "",
    stage: "",
    budget: "",
    timeline: "",
    description: "",
  };

  const [form, setForm] = useState<AdminCreateProposalRequest>(() => {
    if (typeof window === "undefined") {
      return emptyForm;
    }

    const saved = sessionStorage.getItem(ADMIN_PROPOSAL_FORM_STORAGE_KEY);

    if (!saved) {
      return emptyForm;
    }

    try {
      const parsed = JSON.parse(saved) as Partial<AdminCreateProposalRequest>;

      return {
        ...emptyForm,
        ...parsed,
      };
    } catch {
      sessionStorage.removeItem(ADMIN_PROPOSAL_FORM_STORAGE_KEY);

      return emptyForm;
    }
  });

  const createMutation = useCreateAdminProposal({
    onSuccess: ({ quoteId }) => {
      sessionStorage.removeItem(ADMIN_PROPOSAL_FORM_STORAGE_KEY);
      toast.success("Proposal created successfully.");

      router.push(`/admin/project-hub/${quoteId}`);
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateField = (
    field: keyof AdminCreateProposalRequest,
    value: string,
  ) => {
    setForm((current) => {
      const updated = {
        ...current,
        [field]: value,
      };

      sessionStorage.setItem(
        ADMIN_PROPOSAL_FORM_STORAGE_KEY,
        JSON.stringify(updated),
      );

      return updated;
    });
  };

  const canSubmit =
    form.name.trim() &&
    form.email.trim() &&
    form.projectType &&
    form.stage &&
    form.timeline &&
    form.description.trim().length >= 20;

  function handleSubmit() {
    if (!canSubmit || createMutation.isPending) {
      return;
    }

    createMutation.mutate(form);
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Reset this form? All entered proposal information will be cleared.",
    );

    if (!confirmed) return;

    sessionStorage.removeItem(ADMIN_PROPOSAL_FORM_STORAGE_KEY);

    setForm({
      name: "",
      email: "",
      projectType: "",
      stage: "",
      budget: "",
      timeline: "",
      description: "",
    });

    toast.success("Form reset.");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm text-muted-foreground">Admin</p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Create Proposal
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Enter the client request and let AI create the initial proposal for
            the Project Hub.
          </p>
        </div>

        <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
          {/* Client */}
          <section className="space-y-4">
            <div>
              <h2 className="font-medium">Client</h2>

              <p className="text-sm text-muted-foreground">
                Basic client information.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Client name"
                className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:border-blue-500"
              />

              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="Client email"
                className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </section>

          {/* Project */}
          <section className="space-y-4">
            <div>
              <h2 className="font-medium">Project</h2>

              <p className="text-sm text-muted-foreground">
                Information used by the AI generator.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {projectTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField("projectType", type)}
                  className={`rounded-xl border p-3 text-left text-sm transition ${
                    form.projectType === type
                      ? "border-blue-500 bg-blue-500/10"
                      : "hover:bg-muted/40"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          {/* Stage */}
          <section className="space-y-4">
            <h2 className="font-medium">Current Stage</h2>

            <div className="grid gap-2 sm:grid-cols-2">
              {stages.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => updateField("stage", stage)}
                  className={`rounded-xl border p-3 text-left text-sm transition ${
                    form.stage === stage
                      ? "border-blue-500 bg-blue-500/10"
                      : "hover:bg-muted/40"
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </section>

          {/* Budget */}
          <section className="space-y-4">
            <h2 className="font-medium">Budget</h2>

            <div className="grid gap-2 sm:grid-cols-2">
              {budgets.map((budget) => (
                <button
                  key={budget}
                  type="button"
                  onClick={() => updateField("budget", budget)}
                  className={`rounded-xl border p-3 text-left text-sm transition ${
                    form.budget === budget
                      ? "border-blue-500 bg-blue-500/10"
                      : "hover:bg-muted/40"
                  }`}
                >
                  {budget}
                </button>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="space-y-4">
            <h2 className="font-medium">Timeline</h2>

            <div className="grid gap-2 sm:grid-cols-2">
              {timelines.map((timeline) => (
                <button
                  key={timeline}
                  type="button"
                  onClick={() => updateField("timeline", timeline)}
                  className={`rounded-xl border p-3 text-left text-sm transition ${
                    form.timeline === timeline
                      ? "border-blue-500 bg-blue-500/10"
                      : "hover:bg-muted/40"
                  }`}
                >
                  {timeline}
                </button>
              ))}
            </div>
          </section>

          {/* Description */}
          <section className="space-y-4">
            <div>
              <h2 className="font-medium">Project Description</h2>

              <p className="text-sm text-muted-foreground">
                More detail gives the AI better context.
              </p>
            </div>

            <textarea
              rows={6}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe what the client needs..."
              className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </section>

          {/* Admin Notes */}
          <section className="space-y-4">
            <div>
              <h2 className="font-medium">Admin Notes</h2>

              <p className="text-sm text-muted-foreground">
                Internal context for the AI. These won't be treated as
                client-provided requirements.
              </p>
            </div>

            {/* <textarea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Example: Client prefers a premium design and wants WhatsApp as the main CTA."
              className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-blue-500"
            /> */}
          </section>

          {/* Generate and reset */}
          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || createMutation.isPending}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Proposal...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Proposal
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={createMutation.isPending}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border/60 px-5 text-sm font-medium text-muted-foreground transition hover:bg-muted/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset Form
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
