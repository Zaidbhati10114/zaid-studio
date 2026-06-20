"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  MapPin,
  Calendar,
  User,
  Zap,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { CaseStudy } from "@/lib/case-studies";
import { cn } from "@/lib/utils";

const CAL_LINK = "https://cal.com/zaidbhati07/30min";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

interface Props {
  study: CaseStudy;
}

export default function CaseStudyClient({ study }: Props) {
  return (
    <div className="flex flex-col">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-16 pt-24 sm:pt-28">
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[400px] w-[min(600px,100vw)] -translate-x-1/2 rounded-full bg-emerald-600/6 blur-[80px]" />

        <div className="mx-auto max-w-4xl">
          <motion.div {...fadeUp(0)}>
            <Link
              href="/work"
              className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              All case studies
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0.06)}>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-emerald-500">
              {study.industry} · Case Study
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {study.tagline}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {study.description}
            </p>
          </motion.div>

          {/* Meta strip */}
          <motion.div
            {...fadeUp(0.1)}
            className="mt-8 flex flex-wrap items-center gap-6 border-t border-border/30 pt-6"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {study.location}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-3.5 shrink-0" />
              {study.builtIn}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-3.5 shrink-0" />
              {study.role}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#4ade80]" />
                {study.statusLabel}
              </span>
              <a
                href={study.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary/50"
              >
                Visit site
                <ExternalLink className="size-3" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Separator className="opacity-30" />

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-6 py-12">
        <motion.div
          {...fadeUp(0)}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {study.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              {...fadeUp(i * 0.06)}
              className="rounded-2xl border border-border/50 bg-card/20 p-5 text-center"
            >
              <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Separator className="opacity-30" />

      {/* ── PROBLEM ───────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-6 py-16">
        <motion.div {...fadeUp(0)} className="mb-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            The problem
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {study.problem.headline}
          </h2>
        </motion.div>

        <div className="flex flex-col gap-4">
          {study.problem.body.map((para, i) => (
            <motion.p
              key={i}
              {...fadeUp(i * 0.06)}
              className="text-sm leading-relaxed text-muted-foreground sm:text-base"
            >
              {para}
            </motion.p>
          ))}
        </div>
      </section>

      <Separator className="opacity-30" />

      {/* ── SOLUTION ──────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-6 py-16">
        <motion.div {...fadeUp(0)} className="mb-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            The solution
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {study.solution.headline}
          </h2>
        </motion.div>
        <motion.p
          {...fadeUp(0.06)}
          className="text-sm leading-relaxed text-muted-foreground sm:text-base"
        >
          {study.solution.body}
        </motion.p>
      </section>

      <Separator className="opacity-30" />

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-6 py-16">
        <motion.div {...fadeUp(0)} className="mb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            What was built
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Every feature, and why it exists
          </h2>
        </motion.div>

        <div className="flex flex-col gap-4">
          {study.features.map((feature, i) => (
            <motion.div
              key={feature.title}
              {...fadeUp(i * 0.06)}
              className="rounded-2xl border border-border/50 bg-card/20 p-5 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-secondary/30 text-xl">
                  {feature.icon}
                </span>
                <div>
                  <h3 className="text-base font-medium">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator className="opacity-30" />

      {/* ── TECH STACK ────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-6 py-16">
        <motion.div {...fadeUp(0)} className="mb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Tech stack
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            What it's built with, and why
          </h2>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2">
          {study.tech.map((t, i) => (
            <motion.div
              key={t.name}
              {...fadeUp(i * 0.05)}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/20 px-4 py-3"
            >
              <span className="mt-0.5 flex size-2 shrink-0 rounded-full bg-blue-500" />
              <div>
                <span className="text-sm font-medium">{t.name}</span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.reason}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator className="opacity-30" />

      {/* ── OUTCOME ───────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-6 py-16">
        <motion.div {...fadeUp(0)} className="mb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            The outcome
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            What changed after launch
          </h2>
        </motion.div>

        <div className="flex flex-col gap-3">
          {study.outcome.map((item, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.06)}
              className="flex items-start gap-3"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator className="opacity-30" />

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="mx-6 mb-24 mt-8">
        <motion.div
          {...fadeUp(0)}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-blue-500/15 bg-blue-500/4 px-8 py-14 text-center"
        >
          <div className="pointer-events-none absolute -top-12 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-blue-600/12 blur-[60px]" />
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-blue-500">
            Want something like this?
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Let's build it for your business
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Get an AI-generated proposal in 30 seconds, or book a free call to
            talk through your idea.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/get-quote"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 sm:w-auto"
            >
              <Zap className="size-3.5" />
              Get a free proposal
            </Link>
            <a
              href={CAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/8 px-6 py-3 text-sm font-medium text-blue-400 transition-all hover:bg-blue-500/12 sm:w-auto"
            >
              Book a free call
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
