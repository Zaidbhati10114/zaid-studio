"use client";

import { useState, useRef, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLockHorizontalScroll } from "@/hooks/useLockHorizontalScroll";
import { useGenerateQuote, type QuoteFormData } from "@/hooks/useQuote";
import { quoteSchema, type QuoteFormValues } from "@/lib/quote-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

const SERVICE_MAP: Record<string, string> = {
  website: "Website",
  webapp: "Web App",
  saas: "SaaS Product",
  custom: "Other",
};

export default function GetQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  useLockHorizontalScroll();

  const router = useRouter();
  const { service } = use(searchParams);

  const prefilledProjectType = service ? (SERVICE_MAP[service] ?? "") : "";

  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
    getValues,
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      projectType: prefilledProjectType,
      stage: "",
      budget: "",
      timeline: "",
      description: "",
    },
  });

  const [step, setStep] = useState(0);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === 0) return;

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [step]);

  const [submitted, setSubmitted] = useState(false);

  const {
    mutate: generateQuote,
    isPending,
    isError,
    error,
  } = useGenerateQuote({
    onSuccess: ({ quoteId }) => {
      setSubmitted(true);
      router.push(`/quotes/${quoteId}`);
    },
  });

  useEffect(() => {
    if (isPending || submitted) {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isPending, submitted]);

  const formValues = watch();

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!formValues.name && !!formValues.email;

      case 1:
        return !!formValues.projectType;

      case 2:
        return !!formValues.stage && !!formValues.timeline;

      case 3:
        return formValues.description?.trim().length >= 20;

      default:
        return false;
    }
  };

  const handleNext = async () => {
    let valid = false;

    switch (step) {
      case 0:
        valid = await trigger(["name", "email"]);
        break;

      case 1:
        valid = await trigger(["projectType"]);
        break;

      case 2:
        valid = await trigger(["stage", "timeline"]);
        break;

      case 3:
        valid = await trigger(["description"]);
        break;
    }

    if (!valid) return;

    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      generateQuote(getValues() as QuoteFormData);
    }
  };

  return (
    <div className="relative flex flex-col overflow-x-hidden">
      {/* HERO */}
      <section className="relative px-6 pb-10 pt-24 sm:pt-28">
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[400px] w-[min(600px,100vw)] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[80px]" />

        <div className="mx-auto max-w-xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs text-blue-400">
              <Sparkles className="size-3" />
              AI-Assisted Proposal Generation
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Generate an{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                AI-powered proposal
              </span>{" "}
              for your project
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Receive realistic pricing, timelines, deliverables, and technical
              recommendations tailored to your project.
            </p>

            <p className="mt-4 text-sm text-muted-foreground">
              Built using AI + real-world product development experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FORM */}
      <section ref={formRef} className="mx-auto w-full max-w-2xl px-6 py-10">
        <AnimatePresence mode="wait">
          {(isPending || submitted) && (
            <motion.div
              key="loading"
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
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
                    transition={{
                      delay: i * 0.7,
                    }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    {s}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {!isPending && !submitted && (
            <motion.div
              key="form"
              initial={{
                opacity: 0,
                x: 4,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -4,
              }}
              transition={{ duration: 0.4 }}
            >
              {/* Progress */}
              <div className="mb-8 flex justify-center">
                <div className="flex w-full max-w-md items-center justify-between px-2 sm:gap-6 sm:px-0">
                  {steps.map((s, i) => (
                    <div
                      key={s}
                      className="flex flex-1 flex-col items-center text-center"
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
                            "text-[11px]",
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

              {/* CARD */}
              <div className="rounded-2xl border border-border/50 bg-card/20 p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {/* STEP 0 */}
                  {step === 0 && (
                    <motion.div
                      key="step0"
                      initial={{
                        opacity: 0,
                        x: 20,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -20,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
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
                            {...register("name")}
                            className="h-11 w-full rounded-xl border border-border/60 bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                          />

                          {errors.name && (
                            <p className="text-sm text-destructive">
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium">
                            Email address
                          </label>

                          <input
                            type="email"
                            placeholder="john@company.com"
                            {...register("email")}
                            className="h-11 w-full rounded-xl border border-border/60 bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                          />

                          {errors.email && (
                            <p className="text-sm text-destructive">
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 1 */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{
                        opacity: 0,
                        x: 20,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -20,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
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
                            type="button"
                            key={pt.value}
                            onClick={() =>
                              setValue("projectType", pt.value, {
                                shouldValidate: true,
                              })
                            }
                            className={cn(
                              "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                              watch("projectType") === pt.value
                                ? "border-blue-500/50 bg-blue-500/8 text-foreground"
                                : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground",
                            )}
                          >
                            <span className="text-xl">{pt.icon}</span>

                            <span className="text-sm font-medium">
                              {pt.label}
                            </span>
                          </button>
                        ))}
                      </div>

                      {errors.projectType && (
                        <p className="text-sm text-destructive">
                          {errors.projectType.message}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{
                        opacity: 0,
                        x: 20,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -20,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className="flex flex-col gap-5"
                    >
                      <div>
                        <h2 className="text-lg font-medium">
                          Tell me a bit more
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                          This helps tailor your proposal better.
                        </p>
                      </div>

                      {/* Stage */}
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
                              type="button"
                              key={option}
                              onClick={() =>
                                setValue("stage", option, {
                                  shouldValidate: true,
                                })
                              }
                              className={cn(
                                "rounded-xl border p-3 text-left text-sm transition",
                                watch("stage") === option
                                  ? "border-blue-500 bg-blue-500/10"
                                  : "border-border/50 hover:border-border",
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>

                        {errors.stage && (
                          <p className="text-sm text-destructive">
                            {errors.stage.message}
                          </p>
                        )}
                      </div>

                      {/* Budget */}
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
                              type="button"
                              key={option}
                              onClick={() =>
                                setValue("budget", option, {
                                  shouldValidate: true,
                                })
                              }
                              className={cn(
                                "rounded-xl border p-3 text-left text-sm transition",
                                watch("budget") === option
                                  ? "border-blue-500 bg-blue-500/10"
                                  : "border-border/50 hover:border-border",
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">
                          When do you need this?
                        </label>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {["ASAP", "2–4 weeks", "1–2 months", "Flexible"].map(
                            (option) => (
                              <button
                                type="button"
                                key={option}
                                onClick={() =>
                                  setValue("timeline", option, {
                                    shouldValidate: true,
                                  })
                                }
                                className={cn(
                                  "rounded-xl border p-3 text-left text-sm transition",
                                  watch("timeline") === option
                                    ? "border-blue-500 bg-blue-500/10"
                                    : "border-border/50 hover:border-border",
                                )}
                              >
                                {option}
                              </button>
                            ),
                          )}
                        </div>

                        {errors.timeline && (
                          <p className="text-sm text-destructive">
                            {errors.timeline.message}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{
                        opacity: 0,
                        x: 20,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -20,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className="flex flex-col gap-5"
                    >
                      <div>
                        <h2 className="text-lg font-medium">
                          Tell me about your project
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                          More detail helps generate a better proposal.
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium">
                          Project description
                        </label>

                        <textarea
                          rows={5}
                          maxLength={1000}
                          placeholder="e.g. I need a SaaS dashboard with user authentication, subscription billing, and analytics..."
                          {...register("description")}
                          className="w-full resize-none rounded-xl border border-border/60 bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        />

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            More details = more accurate proposal
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {watch("description")?.length ?? 0}
                            /1000
                          </p>
                        </div>

                        {errors.description && (
                          <p className="text-sm text-destructive">
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* API ERROR */}
                {isError && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -4,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mt-4 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
                  >
                    {error.message}
                  </motion.div>
                )}

                {/* FOOTER */}
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-0"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed() || isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
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

              {/* TRUST */}
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

              {/* SAMPLE */}
              <div className="mt-3 text-center">
                <Link
                  href="/get-quote/sample"
                  className="text-xs text-muted-foreground transition-colors hover:text-blue-400"
                >
                  Curious what the proposal looks like?{" "}
                  <span className="underline underline-offset-2">
                    View a sample
                  </span>
                </Link>
              </div>

              {/* CONTACT CTA */}
              <div className="mt-8 rounded-2xl border border-border/50 bg-card/20 p-5 text-center">
                <p className="text-sm font-medium">
                  Prefer discussing your project first?
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Book a discovery call or send a message and we’ll discuss your
                  idea, budget, and timeline together.
                </p>

                <Link
                  href="/contact"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-500 hover:text-blue-400"
                >
                  Contact me <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
