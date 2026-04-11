"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  IndianRupee,
  Layers,
  Lightbulb,
  ListChecks,
  Sparkles,
  CalendarDays,
  Code2,
  AlertTriangle,
  UserCheck,
  Package,
  Zap,
  BarChart3,
  Link2,
  Copy,
  Mail,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { sendQuoteEmail } from "@/lib/emailjs";

const CAL_LINK = "https://cal.com/zaidbhati07/30min";
const WHATSAPP_NUMBER = "919503148821";

const complexityConfig: Record<string, { color: string; icon: any }> = {
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

const phaseColors = [
  "border-blue-500/20 bg-blue-500/4",
  "border-purple-500/20 bg-purple-500/4",
  "border-amber-500/20 bg-amber-500/4",
  "border-emerald-500/20 bg-emerald-500/4",
];

const tabs = ["Overview", "Timeline", "Tech", "Next Steps"];

interface QuoteClientProps {
  quote: any;
  id: string;
}

export default function QuoteClient({ quote, id }: QuoteClientProps) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const quoteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/quotes/${id}`
      : `https://zaid-studio.vercel.app/quotes/${id}`;

  const whatsappMessage = encodeURIComponent(
    `Hi Zaid, I checked the proposal for my ${quote?.project_type} project.\n\nHere is the link: ${quoteUrl}\n\nCan we discuss this further?`,
  );

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(quoteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    if (!emailInput.trim()) return;
    setSendingEmail(true);
    setEmailError("");
    try {
      await sendQuoteEmail({
        toEmail: emailInput,
        clientName: quote.name,
        projectType: quote.project_type,
        quoteUrl,
        summary: quote.summary,
        timeline: quote.estimated_timeline,
        cost: quote.estimated_cost,
      });
      setEmailSent(true);
      setEmailInput("");
    } catch (err) {
      setEmailError("Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  // Parse stored JSON fields if they come as strings
  const aiData = {
    complexity: quote.complexity || "Medium",
    summary: quote.summary,
    servicesMatched: quote.services_matched || [],
    estimatedTimeline: quote.estimated_timeline,
    estimatedCost: quote.estimated_cost,
    whyHireMe: quote.why_hire_me,
    deliverables: quote.deliverables || [],
    techStack: quote.tech_stack || [],
    phases: quote.phases || [],
    clientResponsibilities: quote.client_responsibilities || [],
    risks: quote.risks || [],
    vsNoCode: quote.vs_no_code || "",
    nextSteps: quote.next_steps || [],
  };

  const complexity =
    complexityConfig[aiData.complexity] || complexityConfig.Medium;
  const ComplexityIcon = complexity.icon;

  return (
    <div className="flex flex-col">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-10 pt-28">
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[80px]" />
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/get-quote"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Generate another quote
            </Link>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-blue-500">
                  Project Proposal
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {quote.project_type} for {quote.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-medium",
                      complexity.color,
                    )}
                  >
                    <ComplexityIcon className="size-3" />
                    {aiData.complexity} project
                  </span>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    {aiData.estimatedTimeline}
                  </span>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    {aiData.estimatedCost}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Primary */}
                <a
                  href={CAL_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <CalendarDays className="size-3.5" /> Book a Call
                </a>

                {/* Secondary */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-green-500/40 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  💬 Quick Chat
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Separator className="opacity-30" />

      <section className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="flex flex-col gap-5">
          {/* ── TABS ─────────────────────────────────────────── */}
          <div className="flex overflow-x-auto rounded-xl border border-border/50 bg-card/20 p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── TAB CONTENT ──────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4"
            >
              {/* OVERVIEW */}
              {activeTab === "Overview" && (
                <>
                  <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Lightbulb className="size-3.5 text-blue-500" />
                      <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                        Project Summary
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/75">
                      {aiData.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                        <Clock className="size-3.5" />
                        <span className="text-sm font-medium uppercase tracking-widest">
                          Timeline
                        </span>
                      </div>
                      <p className="text-xl font-semibold tracking-tight">
                        {aiData.estimatedTimeline}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/4 p-5">
                      <div className="mb-2 flex items-center gap-2 text-emerald-500">
                        <IndianRupee className="size-3.5" />
                        <span className="text-sm font-medium uppercase tracking-widest">
                          Estimate
                        </span>
                      </div>
                      <p className="text-xl font-semibold tracking-tight break-words">
                        {aiData.estimatedCost}
                      </p>
                    </div>
                  </div>

                  {aiData.deliverables.length > 0 && (
                    <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Package className="size-3.5 text-blue-500" />
                        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                          What You Get
                        </span>
                      </div>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {aiData.deliverables.map((d: string, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-foreground/75"
                          >
                            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500 mt-0.5" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiData.servicesMatched.length > 0 && (
                    <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Layers className="size-3.5 text-blue-500" />
                        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                          Services Matched
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aiData.servicesMatched.map((s: string) => (
                          <span
                            key={s}
                            className="rounded-lg border border-blue-500/20 bg-blue-500/8 px-3 py-1.5 text-sm font-medium text-blue-400"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="size-3.5 text-blue-500" />
                      <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                        Why Zaid Studio
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/75">
                      {aiData.whyHireMe}
                    </p>
                    {aiData.vsNoCode && (
                      <div className="mt-4 rounded-xl border border-amber-500/15 bg-amber-500/5 p-4">
                        <p className="mb-1 text-sm font-medium text-amber-400">
                          Why not no-code?
                        </p>
                        <p className="text-sm text-foreground/70 leading-relaxed">
                          {aiData.vsNoCode}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TIMELINE */}
              {activeTab === "Timeline" && (
                <>
                  {aiData.phases.length > 0 ? (
                    <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <Clock className="size-3.5 text-blue-500" />
                        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                          Project Phases
                        </span>
                      </div>
                      <div className="flex flex-col gap-4">
                        {aiData.phases.map((phase: any, i: number) => (
                          <div
                            key={i}
                            className={cn(
                              "rounded-xl border p-4",
                              phaseColors[i % phaseColors.length],
                            )}
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="flex size-6 items-center justify-center rounded-full bg-background/50 text-xs font-semibold">
                                  {i + 1}
                                </span>
                                <span className="text-sm font-medium">
                                  {phase.name}
                                </span>
                              </div>
                              <span className="rounded-full border border-border/40 bg-background/40 px-2.5 py-0.5 text-sm text-foreground/70">
                                {phase.duration}
                              </span>
                            </div>
                            <ul className="flex flex-col gap-1.5">
                              {phase.tasks?.map((task: string, j: number) => (
                                <li
                                  key={j}
                                  className="flex items-start gap-2 text-sm text-foreground/70"
                                >
                                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-60" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border/50 bg-card/20 p-8 text-center text-sm text-muted-foreground">
                      Timeline details not available for this quote.
                    </div>
                  )}

                  <div className="rounded-2xl border border-blue-500/15 bg-blue-500/4 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">
                          Total Timeline
                        </p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight">
                          {aiData.estimatedTimeline}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">
                          Investment
                        </p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight text-emerald-400">
                          {aiData.estimatedCost}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TECH */}
              {activeTab === "Tech" && (
                <>
                  {aiData.techStack.length > 0 && (
                    <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <Code2 className="size-3.5 text-blue-500" />
                        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                          Recommended Tech Stack
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aiData.techStack.map((tech: string) => (
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

                  {aiData.clientResponsibilities.length > 0 && (
                    <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <UserCheck className="size-3.5 text-blue-500" />
                        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                          What I Need From You
                        </span>
                      </div>
                      <ul className="flex flex-col gap-2.5">
                        {aiData.clientResponsibilities.map(
                          (r: string, i: number) => (
                            <li
                              key={i}
                              className="flex items-start gap-2.5 text-sm text-foreground/75"
                            >
                              <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border/50 bg-secondary/40 text-xs font-medium mt-0.5">
                                {i + 1}
                              </span>
                              {r}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  {aiData.risks.length > 0 && (
                    <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <AlertTriangle className="size-3.5 text-amber-500" />
                        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                          Risks & Mitigations
                        </span>
                      </div>
                      <div className="flex flex-col gap-3">
                        {aiData.risks.map((r: any, i: number) => (
                          <div
                            key={i}
                            className="rounded-xl border border-border/40 bg-background/30 p-4"
                          >
                            <p className="mb-1.5 text-sm font-medium text-amber-400">
                              {r.risk}
                            </p>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                              → {r.mitigation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* NEXT STEPS */}
              {activeTab === "Next Steps" && (
                <>
                  <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <ListChecks className="size-3.5 text-blue-500" />
                      <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                        How to Get Started
                      </span>
                    </div>
                    <ol className="flex flex-col gap-4">
                      {aiData.nextSteps.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/8 text-xs font-medium text-blue-400 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="pt-1 text-sm leading-relaxed text-foreground/75">
                            {s}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-500/4 to-indigo-500/4 p-6 text-center">
                    <p className="text-base font-medium mb-1">
                      Ready to move forward?
                    </p>
                    <p className="text-sm text-foreground/70 mb-5">
                      Book a free 30-min call to discuss this proposal.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <a
                        href={CAL_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        <CalendarDays className="size-4" /> Book a Free Call
                      </a>
                      <a
                        href={`mailto:zaidbhati7007@gmail.com?subject=Re: Project Quote - ${quote.project_type}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 px-6 py-3 text-sm font-medium hover:bg-secondary/50 transition-colors"
                      >
                        Send an Email
                      </a>
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-6 py-3 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-all"
                      >
                        💬 Discuss on WhatsApp
                      </a>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── SHARE LINK CARD ──────────────────────────────── */}
          <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Link2 className="size-3.5 text-blue-500" />
              <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Save or Share This Proposal
              </span>
            </div>
            <p className="mb-3 text-sm text-foreground/70">
              Bookmark this link or share it with your team — this proposal is
              saved permanently.
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

          {/* ── EMAIL CARD ───────────────────────────────────── */}
          <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Mail className="size-3.5 text-blue-500" />
              <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Get This Proposal on Email
              </span>
            </div>
            <p className="mb-4 text-sm text-foreground/70">
              Enter your email and we'll send you this proposal with the link so
              you can access it anytime.
            </p>

            {emailSent ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 className="size-4" />
                Proposal sent! Check your inbox.
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                  className="h-11 flex-1 rounded-xl border border-border/60 bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !emailInput.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {sendingEmail ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                  {sendingEmail ? "Sending..." : "Send to Email"}
                </button>
              </div>
            )}

            {emailError && (
              <p className="mt-2 text-sm text-destructive">{emailError}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
