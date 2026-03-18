"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, CalendarDays } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import FaqSection from "./components/FaqSection";

const CAL_LINK = "https://cal.com/zaidbhati07/30min";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});
const services = [
  {
    tag: "Starter",
    name: "Landing Page",
    desc: "Perfect for personal brand or small business online presence.",
    price: "₹25,000",
    timeline: "3–7 days",
    features: [
      "Responsive design",
      "3–7 day delivery",
      "2 revision rounds",
      "SEO optimized",
    ],
    featured: false,
  },
  {
    tag: "Business",
    name: "Full Stack Web App",
    desc: "End-to-end web application with auth, database, and deployment.",
    price: "₹75,000",
    timeline: "2–4 weeks",
    features: [
      "Auth + database",
      "2–4 week delivery",
      "3 revision rounds",
      "API integration",
    ],
    featured: true,
  },
  {
    tag: "Growth",
    name: "SaaS Product",
    desc: "Full SaaS with payments, dashboard, and scalable architecture.",
    price: "₹1,50,000",
    timeline: "4–8 weeks",
    features: [
      "Stripe/Razorpay billing",
      "4–8 week delivery",
      "Unlimited revisions",
      "Post-launch support",
    ],
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
    name: "Watch Tower",
    desc: "SaaS notification system for real-time Discord alerts on critical business events.",
    tags: ["Next.js", "Discord", "SaaS"],
    href: "https://www.watchtowerapp.shop",
    color: "from-emerald-500/10 to-teal-500/5",
    icon: "🔔",
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
    title: "Design",
    desc: "I wireframe the product and share a clickable prototype before writing a single line of code.",
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
  { num: "50K+", label: "Users Served" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-6 pt-20 pb-16 text-center">
        <div className="dot-grid absolute inset-0 -z-20" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[100px]" />

        <motion.div {...fadeUp(0)} className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/8 px-3 py-1 text-xs text-blue-400">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#4ade80]" />
            Available for new projects
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.08)}
          className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-2px] sm:text-6xl lg:text-7xl"
        >
          We Build Digital{" "}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Products That Scale
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.15)}
          className="mt-5 max-w-xl text-base text-muted-foreground leading-relaxed"
        >
          Zaid Studio is a solo dev studio specializing in fast, scalable web
          apps, SaaS products, and AI-powered tools for startups and ambitious
          businesses.
        </motion.p>

        <motion.div
          {...fadeUp(0.22)}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/get-quote"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all"
          >
            Get a Free Quote <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
          >
            View Our Work
          </Link>
        </motion.div>

        <motion.div
          {...fadeUp(0.3)}
          className="mt-14 flex items-center divide-x divide-border/50"
        >
          {stats.map((s) => (
            <div
              key={s.num}
              className="px-6 text-center first:pl-0 last:pr-0 sm:px-8"
            >
              <div className="text-2xl font-semibold tracking-tight">
                {s.num}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      <Separator className="opacity-30" />

      {/* ── SERVICES ─────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">
            Services
          </p>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-3xl font-semibold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-sm text-muted-foreground">
              Fixed-price packages. No hourly rates, no surprises.
            </p>
          </div>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {services.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 transition-colors",
                s.featured
                  ? "border-blue-500/30 bg-blue-500/4"
                  : "border-border/50 bg-card/30 hover:border-border",
              )}
            >
              {s.featured && (
                <span className="absolute right-4 top-4 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[11px] text-blue-400">
                  Most popular
                </span>
              )}
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">
                {s.tag}
              </p>
              <h3 className="text-lg font-semibold">{s.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {s.desc}
              </p>
              <div className="my-5">
                <span className="text-3xl font-semibold tracking-tight">
                  {s.price}
                </span>
                <span className="ml-1 text-sm text-muted-foreground">
                  / project
                </span>
              </div>
              <ul className="mb-6 flex flex-col gap-2.5">
                {s.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="size-3.5 shrink-0 text-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/get-quote"
                className={cn(
                  "mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  s.featured
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border border-border/60 text-foreground hover:bg-secondary/50",
                )}
              >
                Get started <ArrowRight className="size-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator className="opacity-30" />

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
            Ready to build something?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Get an AI-generated quote instantly, or book a free 30-min call to
            talk through your idea.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/get-quote"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all sm:w-auto"
            >
              Get a Free Quote <ArrowRight className="size-3.5" />
            </Link>
            <a
              href={CAL_LINK}
              target="_blank"
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
  );
}
