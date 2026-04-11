"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

const projectTypes = [
  { value: "Website", label: "Website", icon: "🌐" },
  { value: "Web App", label: "Web App", icon: "⚡" },
  { value: "E-commerce", label: "E-commerce", icon: "🛒" },
  { value: "Mobile App", label: "Mobile App", icon: "📱" },
  { value: "API/Backend", label: "API / Backend", icon: "🔧" },
  { value: "SaaS Product", label: "SaaS Product", icon: "🚀" },
  { value: "Other", label: "Other", icon: "💡" },
];

interface FormData {
  name: string;
  email: string;
  projectType: string;
  description: string;
}

const steps = ["Your details", "Project info", "Description"];

export default function GetQuotePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    projectType: "",
    description: "",
  });

  const canProceed = () => {
    if (step === 0) return form.name.trim() && form.email.trim();
    if (step === 1) return form.projectType !== "";
    if (step === 2) return form.description.trim().length > 10;
    return false;
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/quotes/${data.quoteId}`);
      } else {
        setError(data.error || "Failed to generate quote. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-10 pt-28">
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[80px]" />
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
          </motion.div>
        </div>
      </section>

      <Separator className="opacity-30" />

      {/* ── FORM ───────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-2xl px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Loading state */}
          {loading && (
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
                {[
                  "Analyzing project requirements",
                  "Recommending tech stack",
                  "Building phase timeline",
                  "Calculating estimate",
                ].map((s, i) => (
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
          {!loading && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Progress */}
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
                            "text-[11px] whitespace-nowrap",
                            i === step
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {s}
                        </span>
                      </div>
                      {/* {i < steps.length - 1 && (
                        <div
                          className={cn(
                            "mb-4 h-px flex-1 transition-colors",
                            i < step ? "bg-blue-500/50" : "bg-border/40",
                          )}
                        />
                      )} */}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card/20 p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {/* Step 0 — Details */}
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
                          Let's start with your details
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
                              setForm({ ...form, name: e.target.value })
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
                              setForm({ ...form, email: e.target.value })
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
                              setForm({ ...form, projectType: pt.value })
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

                  {/* Step 2 — Description */}
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
                            setForm({ ...form, description: e.target.value })
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

                {error && (
                  <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
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
                    disabled={!canProceed()}
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

              {/* Badges */}
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

              {/* 🔥 Demo link (separate, clean) */}
              <div className="mt-3 text-center">
                <Link
                  href="/quotes/af7aa9e3-f8be-4207-86f5-4247adaa1436"
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
