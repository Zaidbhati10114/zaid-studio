"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How does the project process work?",
    a: "We start with a free 30-min discovery call to align on scope and goals. From there I send a detailed proposal, collect a 50% deposit, and kick off. You get weekly updates, access to a staging environment, and a final review before launch. The whole process is transparent — no surprises.",
  },
  {
    q: "What are your payment terms?",
    a: "50% upfront to start, 50% on delivery. For larger projects I can split into three milestones — 30% to start, 40% at mid-point, 30% on launch. I accept bank transfer, Razorpay, and Stripe.",
  },
  {
    q: "How long does a project take?",
    a: "A landing page takes 3–7 days. A full-stack web app takes 2–4 weeks. A SaaS product takes 4–8 weeks. These timelines assume clear requirements from your side. The AI quote form gives you a more specific estimate based on your project.",
  },
  {
    q: "Do you work with international clients?",
    a: "Yes. I work with clients globally. Payments can be made in INR or USD via Stripe or bank transfer. I'm available for calls across most time zones — just let me know yours when we connect.",
  },
  {
    q: "What if I'm not happy with the result?",
    a: "Every package includes revision rounds (2 for Starter, 3 for Business, unlimited for Growth). If something isn't right, we fix it. I don't consider a project done until you're satisfied with the deliverable.",
  },
  {
    q: "Do you provide post-launch support?",
    a: "Yes — every project includes 30 days of post-launch support for bug fixes and minor adjustments. Beyond that, I offer monthly maintenance retainers starting at ₹10,000/month for ongoing updates, monitoring, and support.",
  },
  {
    q: "Can you work with an existing codebase?",
    a: "Absolutely. I've led migrations, refactors, and feature additions on existing codebases at scale. Share your repo during the discovery call and I'll give you an honest assessment of what's involved.",
  },
  {
    q: "What technologies do you use?",
    a: "Next.js, React, TypeScript, Node.js, PostgreSQL, MongoDB, Supabase, Convex, Stripe, Razorpay, Clerk, and various AI APIs (OpenAI, Gemini, Groq). I pick the right stack for the project — not just what I'm comfortable with.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">
            FAQ
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Common questions
          </h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Can't find what you're looking for?{" "}
          <a
            href="mailto:zaidbhati7007@gmail.com"
            className="text-blue-500 hover:underline"
          >
            Email me directly.
          </a>
        </p>
      </motion.div>

      {/* FAQ list */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="overflow-hidden rounded-2xl border border-border/50"
      >
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={cn(
              "border-b border-border/40 last:border-0",
              open === i && "bg-secondary/20",
            )}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-secondary/20"
            >
              <span className="text-sm font-medium sm:text-base">{faq.q}</span>
              <span className="shrink-0 flex size-6 items-center justify-center rounded-full border border-border/50 text-muted-foreground">
                {open === i ? (
                  <Minus className="size-3" />
                ) : (
                  <Plus className="size-3" />
                )}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
