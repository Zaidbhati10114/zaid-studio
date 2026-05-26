"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { useLockHorizontalScroll } from "@/hooks/useLockHorizontalScroll";
import { useMutation } from "@tanstack/react-query";
import { sendQuoteEmail } from "@/lib/emailjs";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  IndianRupee,
  Lightbulb,
  Link2,
  ListChecks,
  Loader2,
  Mail,
  Package,
  UserCheck,
  Zap,
  BarChart3,
  Layers,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const CAL_LINK = "https://cal.com/zaidbhati07/30min";
const WHATSAPP_NUMBER = "919503148821";

const complexityConfig: Record<string, { color: string; icon: LucideIcon }> = {
  Simple: {
    color: "border-emerald-500/20 bg-emerald-500/8 text-emerald-400",
    icon: Zap,
  },
  Medium: {
    color: "border-blue-500/20 bg-blue-500/8 text-blue-400",
    icon: BarChart3,
  },
  Complex: {
    color: "border-purple-500/20 bg-purple-500/8 text-purple-400",
    icon: Layers,
  },
};

interface QuotePhase {
  name: string;
  duration: string;
}

interface QuoteRisk {
  risk: string;
  mitigation: string;
}

interface QuoteRecord {
  name: string;
  project_type?: string;
  summary?: string;
  estimated_timeline?: string;
  estimated_cost?: string;
  complexity?: string;
  deliverables?: string[];
  tech_stack?: string[];
  phases?: QuotePhase[];
  client_responsibilities?: string[];
  risks?: QuoteRisk[];
  next_steps?: string[];
  email?: string;
  description?: string;
}

interface QuoteClientProps {
  quote: QuoteRecord;
  id: string;
  isSample?: boolean;
}

// ─── Email mutation fn ────────────────────────────────────────────────────────

interface SendEmailPayload {
  toEmail: string;
  clientName: string;
  projectType: string;
  quoteUrl: string;
  summary: string;
  timeline: string;
  cost: string;
}

async function sendEmail(payload: SendEmailPayload) {
  await sendQuoteEmail(payload);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuoteClient({ quote, id }: QuoteClientProps) {
  useLockHorizontalScroll();

  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const quoteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/quotes/${id}`
      : `https://zaid-studio.vercel.app/quotes/${id}`;

  const bookingNotes = `
Project Type: ${quote.project_type ?? "Project"}

Description:
${quote.description ?? "Not provided"}

Estimated Cost:
${quote.estimated_cost ?? "Not specified"}

Timeline:
${quote.estimated_timeline ?? "Not specified"}

Proposal:
${quoteUrl}
`.trim();

  const calLink =
    `${CAL_LINK}` +
    `?name=${encodeURIComponent(quote.name ?? "")}` +
    `&email=${encodeURIComponent(quote.email ?? "")}` +
    `&notes=${encodeURIComponent(bookingNotes)}`;

  const whatsappMessage = encodeURIComponent(
    `Hi Zaid, I checked the proposal for my ${quote.project_type ?? "project"}.\n\nHere is the link: ${quoteUrl}\n\nCan we discuss this further?`,
  );
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  // ── Email mutation ─────────────────────────────────────────────────────────
  const {
    mutate: triggerSendEmail,
    isPending: sendingEmail,
    isSuccess: emailSent,
    isError: hasEmailError,
    error: emailMutationError,
    reset: resetEmail,
  } = useMutation<void, Error, SendEmailPayload>({
    mutationFn: sendEmail,
    // No retry — emailjs may double-send on retry
    retry: false,
  });

  const handleSendEmail = () => {
    if (!emailInput.trim()) return;
    triggerSendEmail({
      toEmail: emailInput,
      clientName: quote.name,
      projectType: quote.project_type ?? "Project",
      quoteUrl,
      summary: quote.summary ?? "",
      timeline: quote.estimated_timeline ?? "",
      cost: quote.estimated_cost ?? "",
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(quoteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Derived display data ───────────────────────────────────────────────────
  const aiData = {
    complexity: quote.complexity || "Medium",
    summary: quote.summary,
    estimatedTimeline: quote.estimated_timeline,
    estimatedCost: quote.estimated_cost,
    deliverables: quote.deliverables || [],
    techStack: quote.tech_stack || [],
    phases: quote.phases || [],
    clientResponsibilities: quote.client_responsibilities || [],
    risks: quote.risks || [],
    nextSteps: quote.next_steps || [],
  };

  const complexity =
    complexityConfig[aiData.complexity] || complexityConfig.Medium;
  const ComplexityIcon = complexity.icon;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col relative overflow-x-hidden">
      {/* HERO */}
      <section className="relative px-6 pb-10 pt-24 sm:pt-28">
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[400px] w-[min(600px,100vw)] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[80px]" />

        <div className="mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link
              href="/get-quote"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Generate another quote
            </Link>

            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-blue-500">
                  Project Proposal
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {quote.project_type ? `${quote.project_type} ` : ""}
                  {quote.name}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium",
                      complexity.color,
                    )}
                  >
                    <ComplexityIcon className="size-3" />
                    {aiData.complexity} project
                  </span>
                </div>
              </div>

              {/* SUMMARY */}
              <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb className="size-3.5 text-blue-500" />
                  <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    Project Summary
                  </span>
                </div>
                <p className="text-base leading-relaxed text-foreground/80">
                  {aiData.summary ?? "Proposal summary will appear here."}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Tailored based on your requirements
                </p>
              </div>

              {/* TIMELINE + ESTIMATE */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span className="text-sm font-medium uppercase tracking-widest">
                      Timeline
                    </span>
                  </div>
                  <p className="text-2xl font-semibold tracking-tight">
                    {aiData.estimatedTimeline ?? "Timeline to be confirmed"}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/4 p-5">
                  <div className="mb-2 flex items-center gap-2 text-emerald-500">
                    <IndianRupee className="size-3.5" />
                    <span className="text-sm font-medium uppercase tracking-widest">
                      Estimate
                    </span>
                  </div>
                  <p className="break-words text-2xl font-semibold tracking-tight">
                    {aiData.estimatedCost ?? "Estimate to be confirmed"}
                  </p>
                </div>
              </div>

              {/* CTA CARD */}
              <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href={calLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <CalendarDays className="size-4" />
                    Discuss Your Project
                  </a>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-sm font-medium text-green-400 transition-all hover:bg-green-500/20"
                  >
                    💬 Quick Chat on WhatsApp
                  </a>
                </div>
                <div className="mt-4 space-y-1.5 text-center">
                  <p className="text-xs text-muted-foreground">
                    No commitment required — just a quick discussion to explore
                    your idea.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Slots are limited this week — early discussions get priority
                    timelines.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Separator className="opacity-30" />

      {/* CONTENT */}
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-8">
        {/* WHAT YOU GET */}
        {aiData.deliverables.length > 0 && (
          <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Package className="size-3.5 text-blue-500" />
              <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                What You Get
              </span>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {aiData.deliverables.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-foreground/75"
                >
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* WHAT I NEED FROM YOU */}
        {aiData.clientResponsibilities.length > 0 && (
          <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
            <div className="mb-4 flex items-center gap-2">
              <UserCheck className="size-3.5 text-blue-500" />
              <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                What I Need From You
              </span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {aiData.clientResponsibilities.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-foreground/75"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border/50 bg-secondary/40 text-xs font-medium">
                    {i + 1}
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* RECOMMENDED APPROACH */}
        {aiData.complexity !== "Simple" && aiData.phases.length > 0 && (
          <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="size-3.5 text-blue-500" />
              <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Recommended Approach
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {aiData.phases.map((phase, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-background/30 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-6 items-center justify-center rounded-full bg-blue-500/10 text-xs font-medium text-blue-400">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{phase.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {phase.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEXT STEPS */}
        {aiData.nextSteps.length > 0 && (
          <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
            <div className="mb-4 flex items-center gap-2">
              <ListChecks className="size-3.5 text-blue-500" />
              <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Next Steps
              </span>
            </div>
            <ol className="flex flex-col gap-4">
              {aiData.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/8 text-xs font-medium text-blue-400">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-sm leading-relaxed text-foreground/75">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ADVANCED DETAILS */}
        {aiData.complexity !== "Simple" && (
          <details className="rounded-2xl border border-border/50 bg-card/20 p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
              View technical details
              <ChevronDown className="size-4 text-muted-foreground" />
            </summary>
            <div className="mt-5 flex flex-col gap-5">
              {aiData.techStack.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Code2 className="size-3.5 text-blue-500" />
                    <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                      Tech Stack
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiData.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-1.5 text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {aiData.risks.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <AlertTriangle className="size-3.5 text-amber-500" />
                    <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                      Risks & Mitigations
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {aiData.risks.map((r, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-border/40 bg-background/30 p-4"
                      >
                        <p className="mb-1.5 text-sm font-medium text-amber-400">
                          {r.risk}
                        </p>
                        <p className="text-sm leading-relaxed text-foreground/75">
                          {r.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        )}

        {/* SHARE */}
        <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Link2 className="size-3.5 text-blue-500" />
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Save or Share Proposal
            </span>
          </div>
          <p className="mb-3 text-sm text-foreground/70">
            Bookmark this proposal or share it with your team.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-xl border border-border/50 bg-background/50 px-3 py-2.5">
              <p className="truncate text-sm text-muted-foreground">
                {quoteUrl}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                copied
                  ? "border border-emerald-500/20 bg-emerald-500/8 text-emerald-400"
                  : "border border-border/60 hover:bg-secondary/50",
              )}
            >
              {copied ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* EMAIL */}
        <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Mail className="size-3.5 text-blue-500" />
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Get Proposal on Email
            </span>
          </div>
          <p className="mb-4 text-sm text-foreground/70">
            Send this proposal to your email so you can access it anytime.
          </p>

          {emailSent ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-400">
              <CheckCircle2 className="size-4" />
              Proposal sent successfully.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    // Clear previous error when user types again
                    if (hasEmailError) resetEmail();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                  className="h-11 flex-1 rounded-xl border border-border/60 bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !emailInput.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sendingEmail ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                  {sendingEmail ? "Sending..." : "Send to Email"}
                </button>
              </div>

              {hasEmailError && (
                <p className="mt-2 text-sm text-destructive">
                  {emailMutationError?.message ??
                    "Failed to send email. Please try again."}
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
