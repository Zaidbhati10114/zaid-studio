"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const projects = [
  {
    num: "01",
    name: "AI JSON Generator",
    tagline: "AI-powered mock data SaaS with live API endpoints",
    desc: "Developed a SaaS platform that lets developers generate custom JSON mock data instantly and access it via persistent URLs — no backend required. Built with a no-signup, credit-card-free model for instant adoption.",
    tags: ["Next.js", "Gemini API", "SaaS", "TypeScript"],
    results: [
      "Zero friction onboarding — no signup required",
      "Live persistent API endpoints per dataset",
      "Used by developers across 10+ countries",
    ],
    href: "https://json-generator-mu.vercel.app",
    color: "from-blue-500/10 to-indigo-500/5",
    iconBg: "bg-blue-500/15 border-blue-500/20",
    icon: "⚡",
    year: "2026",
  },
  {
    num: "02",
    name: "Mock Builder",
    tagline: "Collaborative AI mock data generator for dev teams",
    desc: "A team-focused SaaS for generating, editing, and managing realistic mock datasets. Built flexible data customization algorithms that produce structurally accurate sample data across any schema.",
    tags: ["Next.js", "AI", "SaaS", "PostgreSQL"],
    results: [
      "Team collaboration with shared workspaces",
      "Custom schema definition and export",
      "Supports JSON, CSV, and SQL output formats",
    ],
    href: "https://mock-builder-git-main-zaidbhati10114s-projects.vercel.app/",
    color: "from-purple-500/10 to-violet-500/5",
    iconBg: "bg-purple-500/15 border-purple-500/20",
    icon: "🧩",
    year: "2023",
  },
  {
    num: "03",
    name: "Creatify",
    tagline: "AI-powered design editor with team collaboration",
    desc: "A comprehensive design editor with drag-and-drop interface, template customization, and AI features including background removal and text-to-image generation. Includes full auth, team collaboration, and subscription billing.",
    tags: ["React", "Node.js", "Stripe", "AI", "Auth"],
    results: [
      "AI background removal and text-to-image built in",
      "Subscription billing with Stripe",
      "Real-time autosave and team workspaces",
    ],
    href: "https://creatify-five.vercel.app",
    color: "from-pink-500/10 to-rose-500/5",
    iconBg: "bg-pink-500/15 border-pink-500/20",
    icon: "🎨",
    year: "2024",
  },
  {
    num: "04",
    name: "Price-Pair",
    tagline: "Real-time price comparison with personalized alerts",
    desc: "A price comparison platform with real-time updates, advanced analytics, and personalized deal alerts. Features country-specific deals, banner customization, and a subscription-based premium tier using Clerk Auth.",
    tags: ["Next.js", "Clerk", "MongoDB", "Analytics"],
    results: [
      "Real-time price updates across multiple sources",
      "Personalized deal alerts via email",
      "Country-specific deals and promotions",
    ],
    href: "https://price-pair.vercel.app",
    color: "from-amber-500/10 to-orange-500/5",
    iconBg: "bg-amber-500/15 border-amber-500/20",
    icon: "💰",
    year: "2024",
  },
  // {
  //   num: "05",
  //   name: "Watch Tower",
  //   tagline: "SaaS Discord notification system for business events",
  //   desc: "A SaaS notification system that fires real-time Discord alerts for critical business events — bug reports, sales, signups. Includes customizable webhooks, notification templates, event filtering, and a user analytics dashboard.",
  //   tags: ["Next.js", "Node.js", "Discord API", "SaaS"],
  //   results: [
  //     "Real-time Discord alerts with sub-second delivery",
  //     "Customizable webhook and event filtering",
  //     "User dashboard with delivery analytics",
  //   ],
  //   href: "https://www.watchtowerapp.shop",
  //   color: "from-emerald-500/10 to-teal-500/5",
  //   iconBg: "bg-emerald-500/15 border-emerald-500/20",
  //   icon: "🔔",
  //   year: "2024",
  // },
  {
    num: "05",
    name: "Twitter Craft",
    tagline: "AI Twitter bio generator powered by Gemini",
    desc: "An AI-powered Twitter bio generator that creates engaging, personalized bios based on user prompts using the Gemini API. Built for speed — generate a compelling bio in seconds.",
    tags: ["Next.js", "Gemini API", "NLP"],
    results: [
      "Instant bio generation via Gemini API",
      "Multiple tone and style options",
      "One-click copy to clipboard",
    ],
    href: "https://twitter-craft.vercel.app",
    color: "from-sky-500/10 to-blue-500/5",
    iconBg: "bg-sky-500/15 border-sky-500/20",
    icon: "✍️",
    year: "2024",
  },
];

export default function WorkPage() {
  return (
    <div className="flex flex-col">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-16 pt-28">
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[80px]" />
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-blue-500">
              Work
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Projects &{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Case Studies
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground leading-relaxed">
              A selection of products and tools built from scratch — from solo
              SaaS apps to AI-powered platforms.
            </p>
          </motion.div>
        </div>
      </section>

      <Separator className="opacity-30" />

      {/* ── PROJECT LIST ─────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-6">
          {projects.map((p, i) => (
            <motion.a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/20 p-6 hover:border-border transition-all sm:p-8"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
                {/* Left — icon + number */}
                <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
                  <div
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-xl border text-xl",
                      p.iconBg,
                    )}
                  >
                    {p.icon}
                  </div>
                  <span className="text-xs font-medium tabular-nums text-muted-foreground lg:mt-1">
                    {p.num}
                  </span>
                </div>

                {/* Center — content */}
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold group-hover:text-blue-400 transition-colors">
                        {p.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {p.tagline}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {p.year}
                      </span>
                      <div className="flex size-7 items-center justify-center rounded-lg border border-border/50 text-muted-foreground group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors">
                        <ArrowUpRight className="size-3.5" />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    {p.desc}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-border/50 bg-secondary/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right — results */}
                <div className="lg:w-64 shrink-0">
                  <div
                    className={cn(
                      "rounded-xl border border-border/40 bg-gradient-to-br p-4",
                      p.color,
                    )}
                  >
                    <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Highlights
                    </p>
                    <ul className="flex flex-col gap-2">
                      {p.results.map((r) => (
                        <li
                          key={r}
                          className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                        >
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-blue-500" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      <div className="mx-6 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-blue-500/15 bg-blue-500/4 px-8 py-14 text-center"
        >
          <div className="pointer-events-none absolute -top-12 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[60px]" />
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Want to build something like this?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Get an AI-generated quote tailored to your project in under 30
            seconds.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/get-quote"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Get a Free Quote <ArrowUpRight className="size-3.5" />
            </a>
            <a
              href="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-5 py-2.5 text-sm font-medium hover:bg-secondary/50 transition-colors"
            >
              About Zaid Studio
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
