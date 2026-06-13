"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { track, AnalyticsEvents } from "@/lib/posthog";
import {
  ArrowRight,
  Check,
  CalendarDays,
  Zap,
  MapPin,
  Clock,
  Briefcase,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FaqSection from "@/app/components/FaqSection";
import { cn } from "@/lib/utils";

const CAL_LINK = "https://cal.com/zaidbhati07/30min";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

// Revision tooltip copy per plan
const revisionTooltips: Record<number, string> = {
  2: "You get 2 rounds of feedback after the first build. You tell me what to change, I update it — up to 2 times. Most small projects wrap up well within this.",
  3: "You get 3 rounds of feedback — more room for tweaks and adjustments as the project takes shape. Ideal for bigger builds.",
};

type Feature = {
  text: string;
  revisions?: number; // if set, shows the ? tooltip
};

const services = [
  {
    tag: "Starter",
    slug: "website",
    name: "Landing Page",
    desc: "Perfect for personal brand or small business online presence.",
    price: "Starting at ₹5,000",
    timeline: "3–7 days",
    caveat: "Domain & hosting not included",
    features: [
      { text: "Looks great on all devices" },
      { text: "Ready in 3–7 days" },
      { text: "2 rounds of revisions", revisions: 2 },
      { text: "Shows up on Google" },
    ] as Feature[],
    featured: false,
  },
  {
    tag: "Business",
    slug: "webapp",
    name: "Full Stack Web App",
    desc: "Custom business platforms, dashboards, and booking systems tailored to your workflow.",
    price: "Starting at ₹25,000",
    timeline: "2–4 weeks",
    caveat: "Third-party API costs not included",
    features: [
      { text: "Login system + data storage" },
      { text: "Ready in 2–4 weeks" },
      { text: "3 rounds of revisions", revisions: 3 },
      { text: "Connected to tools you already use" },
    ] as Feature[],
    featured: true,
  },
  {
    tag: "Growth",
    slug: "saas",
    name: "SaaS Product",
    desc: "MVP-focused SaaS products with subscriptions, dashboards, and future-ready architecture.",
    price: "Starting at ₹50,000",
    timeline: "4–8 weeks",
    caveat: "Ongoing hosting & infra billed separately",
    features: [
      { text: "Online payments built-in" },
      { text: "Ready in 4–8 weeks" },
      { text: "Built to grow with your business" },
      { text: "We fix issues after you go live" },
    ] as Feature[],
    featured: false,
  },
  {
    tag: "Custom",
    slug: "custom",
    name: "Custom Product",
    desc: "Need something more advanced? SaaS platforms, AI tools, marketplaces, and fully custom workflows scoped around your exact idea.",
    price: "Custom pricing",
    timeline: "Depends on scope",
    caveat: "Scope & pricing finalized after discovery call",
    features: [
      { text: "We plan everything together" },
      { text: "Built to grow with your business" },
      { text: "Connects to any tool you need" },
      { text: "We define the project together" },
    ] as Feature[],
    featured: false,
  },
];

const projects = [
  {
    name: "AI JSON Generator",
    desc: "AI-powered SaaS platform generating custom JSON mock data with live API endpoints.",
    tags: ["Next.js", "Gemini API", "SaaS"],
    href: "https://json-generator-mu.vercel.app",
    color: "from-blue-500/10 to-indigo-500/5",
    icon: "⚡",
  },
  {
    name: "Creatify",
    desc: "Comprehensive design editor with AI background removal, text-to-image, and team collaboration.",
    tags: ["React", "Stripe", "AI"],
    href: "https://creatify-five.vercel.app",
    color: "from-purple-500/10 to-pink-500/5",
    icon: "🎨",
  },
  {
    name: "Twitter Craft",
    desc: "An AI-powered Twitter bio generator that creates engaging, personalized bios based on user prompts using the Gemini API. Built for speed — generate a compelling bio in seconds.",
    tags: ["Next.js", "Gemini", "AI"],
    href: "https://twitter-craft.vercel.app",
    color: "from-sky-500/10 to-blue-500/5",
    icon: "✍️",
  },
  {
    name: "Price-Pair",
    desc: "Price comparison platform with real-time updates and personalized deal alerts.",
    tags: ["Next.js", "Clerk", "MongoDB"],
    href: "https://price-pair.vercel.app",
    color: "from-amber-500/10 to-orange-500/5",
    icon: "💰",
  },
];

const steps = [
  {
    num: "01",
    title: "Discovery",
    desc: "Get an AI-generated quote in seconds. Then we hop on a free 30-min call to align on scope and goals.",
  },
  {
    num: "02",
    title: "Design Showroom",
    desc: "Before any code is written, you get a private link with 3 real designs built for your business. Browse on desktop and mobile, pick what feels right.",
  },
  {
    num: "03",
    title: "Build",
    desc: "Weekly check-ins, a shared staging environment, and transparent progress updates throughout.",
  },
  {
    num: "04",
    title: "Launch",
    desc: "Deployed, tested, and handed off with full documentation and 30-day post-launch support.",
  },
];

const stats = [
  { num: "3+", label: "Years Experience" },
  { num: "15+", label: "Projects Delivered" },
  { num: "100%", label: "Client Satisfaction" },
];

export default function HomePage() {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col">
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col justify-center overflow-hidden px-6 pt-20 pb-16">
          {/* Background */}
          <div className="dot-grid absolute inset-0 -z-20" />
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20" />
            <div className="absolute left-[-120px] top-[30%] h-[320px] w-[320px] rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-500/10" />
            <div className="absolute right-[-100px] top-[20%] h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-3xl dark:bg-cyan-500/10" />
          </div>

          <div className="mx-auto w-full max-w-6xl">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
              {/* ── LEFT ── */}
              <div className="flex flex-col items-start lg:flex-1">
                {/* Badge */}
                <motion.div {...fadeUp(0)} className="mb-5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/8 px-3 py-1 text-xs text-blue-500 dark:text-blue-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#4ade80]" />
                    Available for new projects
                  </span>
                </motion.div>

                {/* H1 */}
                <motion.h1
                  {...fadeUp(0.08)}
                  className="max-w-xl text-4xl font-semibold leading-[1.05] tracking-[-1.5px] sm:text-5xl lg:text-6xl"
                >
                  Custom Websites &{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                    Digital Products
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  {...fadeUp(0.13)}
                  className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                  Solo dev studio for startups and businesses. Fast, scalable,
                  and built to last.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  {...fadeUp(0.18)}
                  className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:items-center"
                >
                  <Link
                    onClick={() => {
                      track(
                        AnalyticsEvents.GET_YOUR_PROPOSAL_IN_30_SEC_CLICKED,
                        {
                          action: "get_proposal_30_sec",
                          location: "homepage_hero",
                        },
                      );
                    }}
                    href="/get-quote"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-[0_0_24px_rgba(37,99,235,0.4)] sm:py-2.5"
                  >
                    <Zap className="size-3.5" />
                    Get your proposal in 30 sec
                  </Link>
                  <Link
                    href="/work"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/50 sm:py-2.5"
                  >
                    View our work
                    <ArrowRight className="size-3.5" />
                  </Link>
                </motion.div>

                {/* Microcopy */}
                <motion.p
                  {...fadeUp(0.22)}
                  className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span className="flex size-3.5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                    <Check className="size-2.5" />
                  </span>
                  AI-generated. Based on your idea. No calls needed.
                </motion.p>

                {/* Stats */}
                <motion.div
                  {...fadeUp(0.27)}
                  className="mt-10 flex items-center divide-x divide-border/50"
                >
                  {stats.map((s) => (
                    <div
                      key={s.num}
                      className="pr-6 first:pl-0 last:pr-0 sm:pr-8 [&:not(:first-child)]:pl-6 [&:not(:first-child)]:sm:pl-8"
                    >
                      <div className="text-xl font-semibold tracking-tight sm:text-2xl">
                        {s.num}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* ── RIGHT — Studio card ── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
                className="w-full lg:w-[360px] lg:flex-shrink-0"
              >
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
                  {/* Avatar + name + badge */}
                  <div className="border-b border-border/50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-base font-semibold text-white shadow-lg">
                        Z
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          Mohammad Zaid
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Full Stack Developer
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#4ade80]" />
                        Open to work
                      </span>
                    </div>
                    <p className="mt-3.5 text-xs leading-relaxed text-muted-foreground">
                      Building fast, production-ready web apps and SaaS products
                      — from design to deployment, solo, focused, and reliable.
                    </p>
                  </div>

                  {/* Info rows */}
                  <div className="flex flex-col gap-3 border-b border-border/50 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="size-3.5 shrink-0 text-muted-foreground/50" />
                      <span className="w-24 shrink-0 text-xs text-muted-foreground">
                        Based in
                      </span>
                      <span className="text-xs text-foreground">
                        India (IST, UTC+5:30)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="size-3.5 shrink-0 text-muted-foreground/50" />
                      <span className="w-24 shrink-0 text-xs text-muted-foreground">
                        Response time
                      </span>
                      <span className="text-xs text-foreground">
                        Within 24 hours
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="size-3.5 shrink-0 text-muted-foreground/50" />
                      <span className="w-24 shrink-0 text-xs text-muted-foreground">
                        Availability
                      </span>
                      <span className="text-xs text-foreground">
                        Full-time projects
                      </span>
                    </div>
                  </div>

                  {/* What I build */}
                  <div className="border-b border-border/50 px-5 py-4">
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50">
                      What I build
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Business Websites",
                        "Online Stores",
                        "Custom Dashboards",
                        "AI Powered Tools",
                      ].map((item) => (
                        <span
                          key={item}
                          className="rounded-lg border border-border/60 bg-secondary/40 px-2.5 py-1 text-xs text-foreground"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Trust signals */}
                  <div className="border-b border-border/50 px-5 py-4">
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50">
                      Why clients trust me
                    </p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                      {[
                        "100% project completion",
                        "30-day post-launch support",
                        "NDA available",
                        "Free discovery call",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-1.5">
                          <Check className="mt-0.5 size-3 shrink-0 text-blue-500" />
                          <span className="text-xs leading-relaxed text-muted-foreground">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Book a call */}
                  <div className="px-5 py-4">
                    <a
                      href={CAL_LINK}
                      target="_blank"
                      onClick={() => {
                        track(AnalyticsEvents.BOOK_30_MIN_CALL, {
                          action: "book_30_min_call",
                          location: "homepage",
                        });
                      }}
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/8 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all hover:bg-blue-500/12 dark:text-blue-400"
                    >
                      <CalendarDays className="size-3.5" />
                      Book a free 30-min call
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <Separator className="opacity-30" />

        {/* ── CLINIC CARD ──────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-6xl px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground/50">
              Personal project · actively maintained
            </p>

            <div className="overflow-hidden rounded-xl border border-border/50 bg-card/30">
              <div className="flex items-stretch">
                <div className="w-[3px] shrink-0 bg-gradient-to-b from-emerald-500 to-emerald-400" />
                <div className="flex flex-1 flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:gap-8">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-base font-semibold text-foreground">
                        🏥 Ashabi Clinic — Sangli
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#4ade80]" />
                        Recently launched
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      Built & maintain the full digital presence — appointment
                      booking, cancellation, WhatsApp flow, and admin dashboard.
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {[
                        "Appointment booking",
                        "Cancellation system",
                        "WhatsApp integration",
                        "Admin dashboard",
                      ].map((f) => (
                        <span
                          key={f}
                          className="rounded-md border border-border/50 bg-secondary/30 px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href="https://ashabi-clinic.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-emerald-500/20 bg-emerald-500/6 px-4 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400 sm:self-auto"
                  >
                    Visit site
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <Separator className="opacity-30" />

        {/* ── SERVICES ─────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          {/* Header */}
          <motion.div {...fadeUp(0)} className="mb-12">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">
              Services
            </p>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-semibold tracking-tight">
                Simple, transparent pricing
              </h2>
              <p className="text-sm text-muted-foreground">
                Transparent starter pricing tailored to your project scope.
              </p>
            </div>
          </motion.div>

          {/* Grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {services.map((s, i) => (
              <motion.div
                key={s.slug}
                {...fadeUp(i * 0.08)}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-6 transition-colors",
                  s.featured
                    ? "border-blue-500/30 bg-blue-500/[0.04]"
                    : "border-border/50 bg-card/30 hover:border-border/80",
                )}
              >
                {/* Most popular badge */}
                {s.featured && (
                  <span className="absolute right-4 top-4 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[11px] text-blue-400">
                    Most popular
                  </span>
                )}

                {/* Tag */}
                <p className="mb-2.5 text-xs font-medium uppercase tracking-widest text-blue-500">
                  {s.tag}
                </p>

                {/* Name */}
                <h3 className="text-lg font-semibold leading-snug">{s.name}</h3>

                {/* Description */}
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>

                {/* Price block */}
                <div className="my-6 flex min-h-[76px] flex-col justify-center border-y border-border/40 py-4">
                  {s.price !== "Custom pricing" && (
                    <p className="mb-0.5 text-[11px] uppercase tracking-wider text-muted-foreground/60">
                      Starting at
                    </p>
                  )}
                  <p
                    className={cn(
                      "font-semibold leading-none tracking-tight",
                      s.price === "Custom pricing" ? "text-2xl" : "text-3xl",
                    )}
                  >
                    {s.price}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {s.price !== "Custom pricing"
                      ? `/ project · ${s.timeline}`
                      : "Scoped around your idea"}
                  </p>
                </div>

                {/* Features — flex-1 pushes caveat + CTA to bottom */}
                <ul className="flex flex-1 flex-col gap-2.5">
                  {s.features.map((f) => (
                    <li
                      key={f.text}
                      className="flex items-start gap-2 text-sm text-muted-foreground/200"
                    >
                      <Check className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
                      <span className="flex items-center gap-1.5 ">
                        {f.text}
                        {f.revisions && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex items-center text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors focus:outline-none"
                                aria-label="What does this mean?"
                              >
                                <HelpCircle className="size-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              sideOffset={6}
                              className="max-w-[220px] rounded-lg px-3 py-2 text-center text-xs leading-relaxed shadow-md"
                              style={{
                                backgroundColor: "hsl(var(--popover))",
                                color: "hsl(var(--popover-foreground))",
                                border: "1px solid hsl(var(--border))",
                              }}
                            >
                              {revisionTooltips[f.revisions]}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Caveat — sits above CTA, muted */}
                <p className="mt-5 flex items-center gap-1.5 border-t border-border/40 pt-4 text-[11px] text-muted-foreground/101">
                  <span className="text-muted-foreground/30">*</span>
                  {s.caveat}
                </p>

                {/* CTA */}
                <Link
                  href={
                    s.slug === "custom"
                      ? "/contact?from=custom"
                      : `/get-quote?service=${s.slug}`
                  }
                  className={cn(
                    "mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                    s.featured
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-border/60 text-foreground hover:bg-secondary/50",
                  )}
                >
                  {s.slug === "custom" ? "Let's Talk" : "Get Started"}
                  <ArrowRight className="size-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom escape hatch */}
          <motion.p
            {...fadeUp(0.38)}
            className="mt-8 text-center text-xs text-muted-foreground"
          >
            Not sure which fits?{" "}
            <Link
              href="/contact?from=custom"
              className="text-blue-500 underline-offset-2 hover:underline"
            >
              Send a message
            </Link>{" "}
            or{" "}
            <Link
              href="/get-quote"
              className="text-blue-500 underline-offset-2 hover:underline"
            >
              get an AI proposal in 30 sec →
            </Link>
          </motion.p>
        </section>

        <Separator className="opacity-30" />

        {/* ── SHOWROOM FEATURE ─────────────────────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-500/4 to-indigo-500/4 px-8 py-10"
          >
            {/* Background glow */}
            <div className="pointer-events-none absolute -top-10 right-0 h-48 w-64 rounded-full bg-blue-600/8 blur-[60px]" />

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/8 px-3 py-1 text-xs text-blue-400">
                  <span className="size-1.5 rounded-full bg-blue-400" />
                  Design Showroom
                </div>
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  See your site before it's built
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Before we write a single line of code, you get a private link
                  with real designs built specifically for your business. Browse
                  them on desktop and mobile, pick what feels right — then we
                  build.
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {[
                    "2 real designs, built for your business",
                    "Browse on desktop and mobile",
                    "No commitment to see them",
                  ].map((t) => (
                    <div
                      key={t}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <Check className="size-3 shrink-0 text-blue-500" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <a
                href={CAL_LINK}
                target="_blank"
                onClick={() => {
                  track(AnalyticsEvents.DISCUSS_YOUR_PROJECT_CLICKED, {
                    action: "discuss_your_project",
                    location: "DESIGN_SHOWROOM",
                  });
                }}
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/8 px-5 py-3 text-sm font-medium text-blue-400 transition-all hover:bg-blue-500/15"
              >
                <CalendarDays className="size-4" />
                Discuss your project
              </a>
            </div>
          </motion.div>
        </section>

        {/* ── WORK ─────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">
                Work
              </p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Recent projects
              </h2>
            </div>
            <Link
              href="/work"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View all →
            </Link>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p, i) => (
              <motion.a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/30 hover:border-border transition-colors"
              >
                <div
                  className={cn(
                    "flex h-44 items-center justify-center bg-gradient-to-br border-b border-border/40",
                    p.color,
                  )}
                >
                  <div className="flex size-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl backdrop-blur-sm">
                    {p.icon}
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 p-5">
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-border/50 bg-secondary/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-base font-medium group-hover:text-blue-400 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        <Separator className="opacity-30" />

        <Separator className="opacity-30" />

        {/* ── PROCESS ──────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">
              Process
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              How it works
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-hidden rounded-2xl border border-border/50"
          >
            <div className="grid grid-cols-1 divide-y divide-border/50 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              {steps.map((s) => (
                <div
                  key={s.num}
                  className="flex flex-col gap-3 p-7 lg:border-r border-border/50 last:border-0"
                >
                  <span className="text-xs font-medium tabular-nums text-blue-500">
                    {s.num}
                  </span>
                  <h3 className="text-base font-medium">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <Separator className="opacity-30" />

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <FaqSection />

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div className="mx-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-blue-500/15 bg-blue-500/4 px-8 py-16 text-center"
          >
            <div className="pointer-events-none absolute -top-12 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-blue-600/12 blur-[60px]" />
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Let&apos;s turn your idea into a website.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Get an AI-generated quote instantly, or book a free 30-min call to
              talk through your idea.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/get-quote"
                onClick={() => {
                  track(AnalyticsEvents.HOMEPAGE_START_A_PROJECT_CLICKED, {
                    action: "start_project",
                    location: "lets_turn_your_idea_into_a_website_card",
                  });
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all sm:w-auto"
              >
                Get a Free Quote <ArrowRight className="size-3.5" />
              </Link>
              <a
                href={CAL_LINK}
                target="_blank"
                onClick={() => {
                  track(AnalyticsEvents.BOOK_30_MIN_CALL, {
                    action: "discuss_your_project",
                    location:
                      "lets_turn_your_idea_into_a_website_card-book_free__call",
                  });
                }}
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/8 px-6 py-3 text-sm font-medium text-blue-400 hover:bg-blue-500/12 transition-all sm:w-auto"
              >
                <CalendarDays className="size-3.5" />
                Book a Free Call
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
