"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Mail, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const skills = [
  {
    category: "Frontend",
    items: [
      "React.js",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
    ],
  },
  {
    category: "Backend",
    items: ["Node.js", "Express.js", "REST APIs", "Microservices"],
  },
  {
    category: "Databases",
    items: ["PostgreSQL", "MongoDB", "Supabase", "Convex"],
  },
  {
    category: "AI & Integrations",
    items: ["OpenAI API", "Gemini API", "Groq API", "LangChain"],
  },
  {
    category: "Payments & Auth",
    items: ["Stripe", "Razorpay", "Clerk Auth", "JWT", "OAuth"],
  },
  {
    category: "DevOps & Tools",
    items: ["Vercel", "Git", "GitHub", "CI/CD", "Jest"],
  },
];

const timeline = [
  {
    year: "2026",
    title: "Founded Zaid Studio",
    desc: "Launched a solo dev studio to take on client projects independently — building web apps, SaaS products, and AI-powered tools.",
  },
  {
    year: "2023–2026",
    title: "Built 7+ personal products",
    desc: "Shipped AI JSON Generator, Mock Builder, Creatify, Price-Pair, Watch Tower, Twitter Craft, and Color Palettes AI — each a real product with real users.",
  },
  {
    year: "2021–Present",
    title: "Full Stack Developer - Enterprise Software",
    desc: "Built and maintained 15+ enterprise applications serving 50,000+ users. Led TypeScript migration, architected microservices handling 100K+ daily API requests.",
  },
  {
    year: "2021",
    title: "B.Tech — Electronics & Telecom",
    desc: "Graduated from PVPIT, India with a CGPA of 7.44. Coursework in Data Structures, Algorithms, Database Management, and Web Technologies.",
  },
];

const values = [
  {
    icon: "⚡",
    title: "Fast delivery",
    desc: "I respect your timeline. Every project starts with a clear scope and ends with on-time delivery.",
  },
  {
    icon: "🔍",
    title: "Transparent process",
    desc: "Weekly updates, a shared staging environment, and no surprises. You always know where things stand.",
  },
  {
    icon: "🏗️",
    title: "Production-grade code",
    desc: "TypeScript-first, tested, and built to scale. Code you can maintain and build on top of.",
  },
  {
    icon: "🤝",
    title: "End-to-end ownership",
    desc: "From design to deployment. I handle everything so you can focus on your business.",
  },
];

export default function AboutPage() {
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
            className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between"
          >
            <div className="flex-1">
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-blue-500">
                About
              </p>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                A solo studio built on{" "}
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  craft & speed
                </span>
              </h1>
              <p className="mt-4 max-w-lg text-base text-muted-foreground leading-relaxed">
                Zaid Studio is run by Mohammad Zaid Bhati — a full stack
                developer with 3+ years of experience building products that
                serve real users at scale.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  Mumbai, India · Open to remote
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5" />
                  zaidbhati7007@gmail.com
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="size-3.5" />
                  Available for new projects
                </div>
              </div>
            </div>

            {/* Avatar placeholder */}
            <div className="flex shrink-0 flex-col items-center gap-3 lg:items-end">
              <div className="flex size-24 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/8 text-4xl">
                👨‍💻
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1 text-xs text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#4ade80]" />
                Available now
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <Separator className="opacity-30" />

      {/* ── STORY ────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid gap-10 lg:grid-cols-2 lg:gap-16"
        >
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">
              The Story
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Why I started Zaid Studio
            </h2>
          </div>
          <div className="flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              After 3+ years building enterprise applications at Software
              Company — serving 50,000+ users, architecting APIs handling 100K+
              daily requests, and leading TypeScript migrations — I realized I
              wanted to apply that same production-grade thinking to smaller,
              faster projects.
            </p>
            <p>
              I started building my own products on the side. Seven of them
              shipped. Real users, real feedback, real problems solved. That
              process taught me something important: the gap between a good idea
              and a working product is almost always execution speed and
              technical clarity.
            </p>
            <p>
              Zaid Studio exists to close that gap for clients. You bring the
              idea and the domain expertise. I bring the technical stack, the
              architecture decisions, and the ability to ship fast without
              cutting corners.
            </p>
          </div>
        </motion.div>
      </section>

      <Separator className="opacity-30" />

      {/* ── VALUES ───────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">
            How I work
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            What you can expect
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="rounded-2xl border border-border/50 bg-card/20 p-6"
            >
              <div className="mb-4 text-2xl">{v.icon}</div>
              <h3 className="mb-2 text-sm font-medium">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {v.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator className="opacity-30" />

      {/* ── SKILLS ───────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">
            Stack
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Technologies I work with
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s, i) => (
            <motion.div
              key={s.category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-2xl border border-border/50 bg-card/20 p-5"
            >
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">
                {s.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {s.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-border/50 bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator className="opacity-30" />

      {/* ── TIMELINE ─────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">
            Timeline
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Experience & background
          </h2>
        </motion.div>

        <div className="flex flex-col gap-0">
          {timeline.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative flex gap-6 pb-10 last:pb-0"
            >
              {/* Line */}
              {i < timeline.length - 1 && (
                <div className="absolute left-[19px] top-8 h-full w-px bg-border/40" />
              )}
              {/* Dot */}
              <div className="relative z-10 mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/8">
                <div className="size-2 rounded-full bg-blue-500" />
              </div>
              <div className="flex flex-col gap-1 pt-1.5">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium">{t.title}</h3>
                  <span className="rounded-md border border-border/50 bg-secondary/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                    {t.year}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                  {t.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
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
            Let's build something together
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Currently accepting new projects. Get a quote in under 30 seconds.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/get-quote"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Start a Project <ArrowRight className="size-3.5" />
            </Link>
            <a
              href="mailto:zaidbhati7007@gmail.com"
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-5 py-2.5 text-sm font-medium hover:bg-secondary/50 transition-colors"
            >
              Send an Email
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
