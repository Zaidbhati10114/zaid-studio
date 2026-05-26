"use client";

import { useState, useRef, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLockHorizontalScroll } from "@/hooks/useLockHorizontalScroll";
import { useGenerateQuote, type QuoteFormData } from "@/hooks/useQuote";

const projectTypes = [
  { value: "Website", label: "Website", icon: "🌐" },
  { value: "Web App", label: "Web App", icon: "⚡" },
  { value: "E-commerce", label: "E-commerce", icon: "🛒" },
  { value: "Mobile App", label: "Mobile App", icon: "📱" },
  { value: "API/Backend", label: "API / Backend", icon: "🔧" },
  { value: "SaaS Product", label: "SaaS Product", icon: "🚀" },
  { value: "Other", label: "Other", icon: "💡" },
];

const steps = [
  "Your details",
  "Project info",
  "Project context",
  "Description",
];

const GENERATION_STEPS = [
  "Analyzing project requirements",
  "Recommending tech stack",
  "Building phase timeline",
  "Calculating estimate",
];

// Maps URL ?service= param → projectType value
const SERVICE_MAP: Record<string, string> = {
  website: "Website",
  webapp: "Web App",
  saas: "SaaS Product",
  custom: "Other",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function GetQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  useLockHorizontalScroll();

  const router = useRouter();
  const { service } = use(searchParams);

  const prefilledProjectType = service ? (SERVICE_MAP[service] ?? "") : "";

  const [step, setStep] = useState(0);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === 0) return; // don't scroll on initial load
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [step]);
  // Latched to true on success — prevents the form flashing back while
  // the router is still navigating to /quotes/[id]
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<QuoteFormData>({
    name: "",
    email: "",
    projectType: prefilledProjectType,
    stage: "",
    budget: "",
    timeline: "",
    description: "",
  });

  // ── React Query mutation ───────────────────────────────────────────────────
  const {
    mutate: generateQuote,
    isPending,
    isError,
    error,
    reset: resetMutation,
  } = useGenerateQuote({
    onSuccess: ({ quoteId }) => {
      setSubmitted(true);
      router.push(`/quotes/${quoteId}`);
    },
  });

  // ── Step validation ────────────────────────────────────────────────────────
  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return !!(form.name.trim() && form.email.trim());
      case 1:
        return !!form.projectType;
      case 2:
        return !!(form.stage && form.timeline);
      case 3:
        return form.description.trim().length > 10;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      generateQuote(form);
    }
  };

  // Clear mutation error when user starts editing again
  const handleFieldChange = (patch: Partial<QuoteFormData>) => {
    if (isError) resetMutation();
    setForm((prev) => ({ ...prev, ...patch }));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col relative overflow-x-hidden">
      {/* HEADER */}
      <section className="relative px-6 pb-10 pt-28">
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[400px] w-[min(600px,100vw)] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[80px]" />
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-blue-500">
              Get a Quote
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              AI-powered{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                project proposal
              </span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Answer 3 quick questions and get a detailed proposal with
              timeline, deliverables, tech stack and more — in under 30 seconds.
            </p>
            <div className="mt-5 inline-flex items-start gap-2 rounded-xl border border-blue-500/15 bg-blue-500/5 px-4 py-3 text-left">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-blue-400" />
              <p className="text-sm leading-relaxed text-foreground/75">
                This proposal combines AI with my real-world development
                experience building production-grade applications — giving you a
                more practical and tailored project estimate.
              </p>
            </div>
            <div className="mt-5 rounded-xl border border-border/50 bg-card/20 px-4 py-3 text-sm">
              <p className="text-muted-foreground">
                Not ready for a proposal yet?{" "}
                <Link
                  href="/contact"
                  className="font-medium text-blue-500 hover:text-blue-400"
                >
                  Book a discovery call or send a message →
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Separator className="opacity-30" />

      {/* FORM */}
      <section ref={formRef} className="mx-auto w-full max-w-2xl px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Loading state — shown while generating OR while router is navigating */}
          {(isPending || submitted) && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center gap-6 py-20 text-center"
            >
              <div className="relative">
                <div className="size-16 rounded-full border border-blue-500/20 bg-blue-500/8" />
                <Loader2 className="absolute inset-0 m-auto size-7 animate-spin text-blue-500" />
              </div>
              <div>
                <p className="text-base font-medium">
                  Building your proposal...
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  AI is crafting a detailed project plan for you
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                {GENERATION_STEPS.map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.7 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    {s}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Form */}
          {!isPending && !submitted && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.4 }}
            >
              {/* Progress indicator */}
              <div className="mb-8 flex justify-center">
                <div className="flex items-center justify-between w-full max-w-md px-2 sm:px-0 sm:gap-6">
                  {steps.map((s, i) => (
                    <div
                      key={s}
                      className="flex flex-col items-center text-center flex-1"
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={cn(
                            "flex size-7 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                            i < step
                              ? "border-blue-500 bg-blue-500 text-white"
                              : i === step
                                ? "border-blue-500 text-blue-500"
                                : "border-border/50 text-muted-foreground",
                          )}
                        >
                          {i < step ? (
                            <CheckCircle2 className="size-3.5" />
                          ) : (
                            i + 1
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[11px] text-center",
                            i === step
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {s}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card/20 p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {/* Step 0 — Your details */}
                  {step === 0 && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-5"
                    >
                      <div>
                        <h2 className="text-lg font-medium">
                          Let&apos;s start with your details
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          So we can personalize your proposal.
                        </p>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium">
                            Your name
                          </label>
                          <input
                            type="text"
                            placeholder="John Smith"
                            value={form.name}
                            onChange={(e) =>
                              handleFieldChange({ name: e.target.value })
                            }
                            className="h-11 w-full rounded-xl border border-border/60 bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium">
                            Email address
                          </label>
                          <input
                            type="email"
                            placeholder="john@company.com"
                            value={form.email}
                            onChange={(e) =>
                              handleFieldChange({ email: e.target.value })
                            }
                            className="h-11 w-full rounded-xl border border-border/60 bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1 — Project type */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-5"
                    >
                      <div>
                        <h2 className="text-lg font-medium">
                          What are you building?
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Select the type that best describes your project.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
                        {projectTypes.map((pt) => (
                          <button
                            key={pt.value}
                            onClick={() =>
                              handleFieldChange({ projectType: pt.value })
                            }
                            className={cn(
                              "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                              form.projectType === pt.value
                                ? "border-blue-500/50 bg-blue-500/8 text-foreground"
                                : "border-border/50 hover:border-border text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <span className="text-xl">{pt.icon}</span>
                            <span className="text-sm font-medium">
                              {pt.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2 — Project context */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-5"
                    >
                      <div>
                        <h2 className="text-lg font-medium">
                          Tell me a bit more
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          This helps me tailor your proposal better.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">
                          Current stage
                        </label>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {[
                            "Starting from scratch",
                            "I have a basic website",
                            "Need redesign",
                            "Need advanced features",
                          ].map((option) => (
                            <button
                              key={option}
                              onClick={() =>
                                handleFieldChange({ stage: option })
                              }
                              className={cn(
                                "rounded-xl border p-3 text-left text-sm transition",
                                form.stage === option
                                  ? "border-blue-500 bg-blue-500/10"
                                  : "border-border/50 hover:border-border",
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">
                          Budget (optional)
                        </label>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {[
                            "Under ₹50k",
                            "₹50k – ₹1L",
                            "₹1L – ₹3L",
                            "₹3L+",
                            "Not sure",
                          ].map((option) => (
                            <button
                              key={option}
                              onClick={() =>
                                handleFieldChange({ budget: option })
                              }
                              className={cn(
                                "rounded-xl border p-3 text-left text-sm transition",
                                form.budget === option
                                  ? "border-blue-500 bg-blue-500/10"
                                  : "border-border/50 hover:border-border",
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">
                          When do you need this?
                        </label>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {["ASAP", "2–4 weeks", "1–2 months", "Flexible"].map(
                            (option) => (
                              <button
                                key={option}
                                onClick={() =>
                                  handleFieldChange({ timeline: option })
                                }
                                className={cn(
                                  "rounded-xl border p-3 text-left text-sm transition",
                                  form.timeline === option
                                    ? "border-blue-500 bg-blue-500/10"
                                    : "border-border/50 hover:border-border",
                                )}
                              >
                                {option}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 — Description */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-5"
                    >
                      <div>
                        <h2 className="text-lg font-medium">
                          Tell me about your project
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          The more detail you give, the more accurate your
                          proposal will be.
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium">
                          Project description
                        </label>
                        <textarea
                          rows={5}
                          placeholder="e.g. I need a SaaS dashboard with user authentication, subscription billing, and a usage analytics page..."
                          value={form.description}
                          maxLength={500}
                          onChange={(e) =>
                            handleFieldChange({ description: e.target.value })
                          }
                          className="w-full resize-none rounded-xl border border-border/60 bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        />
                        <p className="text-xs text-muted-foreground">
                          {form.description.length}/500 characters
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error banner — only shown when mutation fails */}
                {isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
                  >
                    {error.message}
                    {error.details && (
                      <span className="ml-1 opacity-60">({error.details})</span>
                    )}
                  </motion.div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-0 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!canProceed() || isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {step === steps.length - 1 ? (
                      <>
                        Generate Proposal <Sparkles className="size-3.5" />
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-5">
                {[
                  "Free, no commitment",
                  "Saved permanently",
                  "Detailed & tailored",
                ].map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    {t}
                  </div>
                ))}
              </div>

              <div className="mt-3 text-center">
                <Link
                  href="/get-quote/sample"
                  className="text-xs text-muted-foreground hover:text-blue-400 transition-colors"
                >
                  Curious what the proposal looks like?{" "}
                  <span className="underline underline-offset-2">
                    View a sample
                  </span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
