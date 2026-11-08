"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Link2,
  UploadCloud,
  Send,
  Loader2,
  AlertCircle,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { OnboardingForm } from "@/lib/types/onboarding";

interface Props {
  form: OnboardingForm;
  slug: string;
}

export default function OnboardingClient({ form, slug }: Props) {
  const storageKey = `zaid_studio_onboarding_${slug}`;

  const [clientName, setClientName] = useState<string>(() => {
    if (typeof window === "undefined") return form.client_name || "";
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clientName) return parsed.clientName;
      }
    } catch {
      // ignore
    }
    return form.client_name || "";
  });

  const [clientEmail, setClientEmail] = useState<string>(() => {
    if (typeof window === "undefined") return form.client_email || "";
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clientEmail) return parsed.clientEmail;
      }
    } catch {
      // ignore
    }
    return form.client_email || "";
  });

  const [answers, setAnswers] = useState<
    Record<string, string | string[] | number | boolean>
  >(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) return parsed.answers;
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Save to localStorage when answers change
  function handleAnswerChange(
    fieldId: string,
    value: string | string[] | number | boolean
  ) {
    setAnswers((prev) => {
      const next = { ...prev, [fieldId]: value };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ answers: next, clientName, clientEmail })
          );
        } catch {
          // ignore
        }
      }
      return next;
    });
    if (error) setError("");
  }

  function handleCheckboxToggle(fieldId: string, option: string) {
    const current = (answers[fieldId] as string[]) || [];
    const exists = current.includes(option);
    const updated = exists
      ? current.filter((o) => o !== option)
      : [...current, option];
    handleAnswerChange(fieldId, updated);
  }

  // Calculate completion percentage
  const inputFields = useMemo(
    () => form.fields.filter((f) => f.type !== "section_header"),
    [form.fields]
  );

  const answeredCount = useMemo(() => {
    return inputFields.filter((field) => {
      const val = answers[field.id];
      if (val === undefined || val === null || val === "") return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    }).length;
  }, [inputFields, answers]);

  const completionPercentage =
    inputFields.length > 0
      ? Math.round((answeredCount / inputFields.length) * 100)
      : 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validate required fields
    for (const field of form.fields) {
      if (field.required && field.type !== "section_header") {
        const val = answers[field.id];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          setError(`Please complete required question: "${field.label}"`);
          const el = document.getElementById(`field-${field.id}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/onboarding/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          client_name: clientName,
          client_email: clientEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit answers.");
      }

      setSubmitted(true);
      setSubmittedAt(data.submittedAt || new Date().toISOString());
      if (typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-emerald-500/20 bg-card/60 p-8 sm:p-12 text-center backdrop-blur-md shadow-2xl space-y-6"
        >
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="size-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">
              Onboarding Received
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Thank you, {clientName}!
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your onboarding information for{" "}
              <span className="text-foreground font-medium">
                {form.project_title}
              </span>{" "}
              has been recorded and sent directly to our development team.
            </p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/50 p-4 text-xs text-left space-y-2">
            <div className="flex items-center justify-between text-muted-foreground border-b border-border/40 pb-2">
              <span className="font-medium">Recorded Submission</span>
              <span>{new Date(submittedAt).toLocaleString()}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We will review your assets, verify repository and credential access, and confirm everything prior to the kickoff call.
            </p>
          </div>

          {/* Next steps list */}
          <div className="rounded-2xl border border-border/50 bg-card/40 p-5 text-left space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              What Happens Next
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                  1
                </span>
                <span>
                  Asset verification: We review your brand guidelines, logos, and access details.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                  2
                </span>
                <span>
                  Sprint planning & environment setup: Architecture, database staging, and initial code scaffolding.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                  3
                </span>
                <span>
                  Project Kickoff & first progress demo according to the agreed timeline.
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => window.print()}
            >
              <Printer className="mr-2 size-3.5" />
              Print / Save Responses
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              onClick={() => window.location.reload()}
            >
              Review or Edit Submission
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 pt-28 pb-20 space-y-8">
      {/* Hero Header */}
      <div className="space-y-3 text-center sm:text-left border-b border-border/40 pb-6">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs px-2.5 py-0.5"
          >
            Zaid Studio • Client Onboarding
          </Badge>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground font-medium">
            {form.project_title}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
          {form.title}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          {form.description ||
            "Please complete this discovery and onboarding questionnaire so we can assemble everything needed for a rapid, flawless project kickoff."}
        </p>

        {/* Floating / Sticky Progress Indicator */}
        <div className="pt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>
              Questionnaire Progress ({answeredCount} of {inputFields.length}{" "}
              answered)
            </span>
            <span className="font-semibold text-foreground">
              {completionPercentage}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Client Metadata section */}
        <div className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Information
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Alex Henderson"
                required
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Work Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="e.g. alex@company.com"
                required
                className="h-10 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Fields */}
        <div className="space-y-6">
          {form.fields.map((field, index) => {
            if (field.type === "section_header") {
              return (
                <div
                  key={field.id}
                  className="pt-6 border-t border-border/40 space-y-1"
                >
                  <h3 className="text-lg font-bold tracking-tight text-foreground">
                    {field.label}
                  </h3>
                  {field.description && (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                </div>
              );
            }

            const val = answers[field.id];

            return (
              <div
                id={`field-${field.id}`}
                key={field.id}
                className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6 transition-all hover:border-border hover:bg-card/60 backdrop-blur-sm space-y-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <label className="text-sm font-semibold text-foreground">
                    <span className="text-muted-foreground font-normal mr-1">
                      {index + 1}.
                    </span>
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 font-bold ml-1">*</span>
                    )}
                  </label>

                  {field.category && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] py-0 px-2 font-normal text-muted-foreground shrink-0"
                    >
                      {field.category}
                    </Badge>
                  )}
                </div>

                {field.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {field.description}
                  </p>
                )}

                {/* Render field according to type */}
                {field.type === "text" && (
                  <Input
                    value={(val as string) || ""}
                    onChange={(e) =>
                      handleAnswerChange(field.id, e.target.value)
                    }
                    placeholder={field.placeholder || "Type your answer..."}
                    className="h-10 text-xs"
                  />
                )}

                {field.type === "textarea" && (
                  <Textarea
                    value={(val as string) || ""}
                    onChange={(e) =>
                      handleAnswerChange(field.id, e.target.value)
                    }
                    placeholder={field.placeholder || "Type your answer..."}
                    className="text-xs min-h-[96px] leading-relaxed"
                  />
                )}

                {field.type === "url" && (
                  <div className="relative">
                    <Link2 className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      type="url"
                      value={(val as string) || ""}
                      onChange={(e) =>
                        handleAnswerChange(field.id, e.target.value)
                      }
                      placeholder={field.placeholder || "https://..."}
                      className="pl-9 h-10 text-xs font-mono"
                    />
                  </div>
                )}

                {field.type === "file" && (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <UploadCloud className="absolute left-3 top-3 size-4 text-blue-400" />
                      <Input
                        value={(val as string) || ""}
                        onChange={(e) =>
                          handleAnswerChange(field.id, e.target.value)
                        }
                        placeholder={
                          field.placeholder ||
                          "https://drive.google.com/drive/folders/... or Figma link"
                        }
                        className="pl-9 h-10 text-xs font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Tip: Share a Google Drive, Dropbox, or Figma link with
                      &quot;Anyone with link can view&quot; permissions.
                    </p>
                  </div>
                )}

                {field.type === "date" && (
                  <div className="relative max-w-xs">
                    <Input
                      type="date"
                      value={(val as string) || ""}
                      onChange={(e) =>
                        handleAnswerChange(field.id, e.target.value)
                      }
                      className="h-10 text-xs"
                    />
                  </div>
                )}

                {field.type === "number" && (
                  <div className="max-w-xs">
                    <Input
                      type="number"
                      value={(val as number) || ""}
                      onChange={(e) =>
                        handleAnswerChange(field.id, Number(e.target.value))
                      }
                      placeholder={field.placeholder || "0"}
                      className="h-10 text-xs"
                    />
                  </div>
                )}

                {field.type === "select" && (
                  <select
                    value={(val as string) || ""}
                    onChange={(e) =>
                      handleAnswerChange(field.id, e.target.value)
                    }
                    aria-label={field.label}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">-- Please select an option --</option>
                    {(field.options || []).map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === "radio" && (
                  <div className="space-y-2">
                    {(field.options || []).map((opt, i) => {
                      const isSelected = val === opt;
                      return (
                        <label
                          key={i}
                          onClick={() => handleAnswerChange(field.id, opt)}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-500/10 text-blue-400 font-medium"
                              : "border-border/50 hover:bg-secondary/40 text-muted-foreground"
                          }`}
                        >
                          <input
                            type="radio"
                            name={field.id}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(field.id, opt)}
                            className="size-4 accent-blue-600"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {field.type === "checkbox" && (
                  <div className="space-y-2">
                    {(field.options || []).map((opt, i) => {
                      const selectedList = (val as string[]) || [];
                      const isSelected = selectedList.includes(opt);
                      return (
                        <label
                          key={i}
                          onClick={() => handleCheckboxToggle(field.id, opt)}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-500/10 text-blue-400 font-medium"
                              : "border-border/50 hover:bg-secondary/40 text-muted-foreground"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCheckboxToggle(field.id, opt)}
                            className="size-4 rounded border-border accent-blue-600"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submission Error Banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Action Bar */}
        <div className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">
                Ready to submit your onboarding information?
              </p>
              <p className="text-[11px] text-muted-foreground">
                Your responses are automatically backed up. You can review them anytime.
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 text-xs shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting Responses...
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Submit Onboarding Details
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
