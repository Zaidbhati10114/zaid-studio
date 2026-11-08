"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  Settings2,
  Mail,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  useOnboardingForm,
  useFormSubmissions,
  useUpdateSubmissionStatus,
} from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { OnboardingSubmission } from "@/lib/types/onboarding";

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const { data: formData, isLoading: isFormLoading } = useOnboardingForm(id);
  const form = formData?.form;

  const { data: subsData, isLoading: isSubsLoading } = useFormSubmissions(id);
  const submissions = subsData?.submissions || [];

  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState<string>("");

  const selectedSubmission: OnboardingSubmission | undefined =
    submissions.find((s) => s.id === selectedSubId) || submissions[0];

  const updateMutation = useUpdateSubmissionStatus({
    onSuccess: () => {
      toast.success("Submission updated.");
    },
    onError: (err) => toast.error(err.message),
  });

  function handleCopyMarkdown() {
    if (!selectedSubmission || !form) return;

    let md = `# Onboarding Submission: ${form.title}\n`;
    md += `**Client:** ${selectedSubmission.client_name} (${selectedSubmission.client_email || "N/A"})\n`;
    md += `**Submitted on:** ${new Date(selectedSubmission.submitted_at).toLocaleString()}\n\n`;
    md += `## Responses\n\n`;

    for (const field of form.fields) {
      if (field.type === "section_header") {
        md += `\n### ${field.label}\n\n`;
        continue;
      }

      const rawVal = selectedSubmission.answers[field.id];
      let formattedVal = "Not provided";
      if (Array.isArray(rawVal)) {
        formattedVal = rawVal.join(", ");
      } else if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
        formattedVal = String(rawVal);
      }

      md += `**${field.label}**\n${formattedVal}\n\n`;
    }

    navigator.clipboard.writeText(md);
    toast.success("All responses copied to clipboard as Markdown!");
  }

  function handleToggleReviewed() {
    if (!selectedSubmission) return;
    const nextStatus =
      selectedSubmission.status === "reviewed" ? "submitted" : "reviewed";
    updateMutation.mutate({
      formId: id,
      submissionId: selectedSubmission.id,
      status: nextStatus,
      notes: internalNotes || undefined,
    });
  }

  function handleSaveNotes() {
    if (!selectedSubmission) return;
    updateMutation.mutate({
      formId: id,
      submissionId: selectedSubmission.id,
      status: selectedSubmission.status,
      notes: internalNotes,
    });
  }

  if (isFormLoading || isSubsLoading || !form) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/admin/onboarding/${form.id}`)}
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
                {form.client_name}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {form.project_title}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Client Responses ({submissions.length})
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => router.push(`/admin/onboarding/${form.id}`)}
          >
            <Settings2 className="mr-1.5 size-3.5" />
            Back to Builder
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => window.open(`/onboard/${form.slug}`, "_blank")}
          >
            <ExternalLink className="mr-1.5 size-3.5" />
            Live Client Form
          </Button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 p-8 text-center bg-card/20 space-y-3">
          <Users className="size-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No submissions received yet</h3>
          <p className="max-w-sm text-xs text-muted-foreground">
            Share the public onboarding link with {form.client_name}. Responses will show up here automatically as soon as they submit.
          </p>
          <Button
            size="sm"
            className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              const url = `${window.location.origin}/onboard/${form.slug}`;
              navigator.clipboard.writeText(url);
              toast.success("Link copied!");
            }}
          >
            <Copy className="mr-1.5 size-3.5" />
            Copy Client Onboarding Link
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Submissions List on Left */}
          <div className="lg:col-span-1 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              All Submissions
            </span>

            <div className="space-y-2">
              {submissions.map((sub) => {
                const isSelected =
                  (selectedSubmission && selectedSubmission.id === sub.id) ||
                  false;

                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubId(sub.id);
                      setInternalNotes(sub.notes || "");
                    }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 shadow-sm"
                        : "border-border/60 bg-card/30 hover:bg-card/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="size-3.5 text-blue-400" />
                        <span className="text-xs font-semibold">
                          {sub.client_name || form.client_name}
                        </span>
                      </div>
                      <Badge
                        variant={
                          sub.status === "reviewed" ? "default" : "secondary"
                        }
                        className={`text-[10px] py-0 px-2 ${
                          sub.status === "reviewed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {sub.status === "reviewed" ? "Reviewed" : "Pending Review"}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </span>
                      <span>
                        {new Date(sub.submitted_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission Details on Right */}
          {selectedSubmission && (
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm space-y-6">
                {/* Response Top Bar */}
                <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-bold">
                      Submission from {selectedSubmission.client_name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                      {selectedSubmission.client_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="size-3" />
                          {selectedSubmission.client_email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(
                          selectedSubmission.submitted_at
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={handleCopyMarkdown}
                    >
                      <Copy className="mr-1.5 size-3.5" />
                      Copy Markdown
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleToggleReviewed}
                      className={`h-8 text-xs text-white ${
                        selectedSubmission.status === "reviewed"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      <CheckCircle2 className="mr-1.5 size-3.5" />
                      {selectedSubmission.status === "reviewed"
                        ? "Mark as Pending"
                        : "Mark as Reviewed"}
                    </Button>
                  </div>
                </div>

                {/* Question and Answer Items */}
                <div className="space-y-4">
                  {form.fields.map((field) => {
                    if (field.type === "section_header") {
                      return (
                        <div
                          key={field.id}
                          className="pt-4 border-t border-border/40 space-y-0.5"
                        >
                          <h3 className="text-sm font-bold text-foreground">
                            {field.label}
                          </h3>
                          {field.description && (
                            <p className="text-[11px] text-muted-foreground">
                              {field.description}
                            </p>
                          )}
                        </div>
                      );
                    }

                    const val = selectedSubmission.answers[field.id];
                    const hasValue =
                      val !== undefined &&
                      val !== null &&
                      val !== "" &&
                      (!Array.isArray(val) || val.length > 0);

                    return (
                      <div
                        key={field.id}
                        className="rounded-xl border border-border/40 bg-background/50 p-3.5 space-y-1.5"
                      >
                        <div className="flex items-baseline justify-between">
                          <p className="text-xs font-semibold text-foreground">
                            {field.label}
                          </p>
                          {field.category && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] py-0 px-1.5 font-normal text-muted-foreground"
                            >
                              {field.category}
                            </Badge>
                          )}
                        </div>

                        {!hasValue ? (
                          <p className="text-xs italic text-muted-foreground">
                            Not answered
                          </p>
                        ) : Array.isArray(val) ? (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {val.map((item, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20"
                              >
                                {item}
                              </Badge>
                            ))}
                          </div>
                        ) : typeof val === "string" &&
                          (val.startsWith("http://") ||
                            val.startsWith("https://")) ? (
                          <a
                            href={val}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-400 underline hover:text-blue-300 break-all"
                          >
                            <ExternalLink className="size-3 flex-shrink-0" />
                            {val}
                          </a>
                        ) : (
                          <p className="text-xs whitespace-pre-wrap text-muted-foreground leading-relaxed">
                            {String(val)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Internal Studio Notes */}
                <div className="border-t border-border/40 pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Internal Studio Notes
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[11px] text-blue-400"
                      onClick={handleSaveNotes}
                    >
                      Save Notes
                    </Button>
                  </div>
                  <Textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add private agency notes about credentials, follow-up questions, or sprint assignments..."
                    className="text-xs min-h-[64px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
