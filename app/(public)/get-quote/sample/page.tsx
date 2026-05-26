import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import QuoteClient from "@/app/components/QuoteClient";

const sampleProposal = {
  name: "Fitness Business Management Platform",
  summary:
    "A complete digital platform for a fitness business with membership management, online payments, and a modern admin dashboard to streamline daily operations.",

  estimated_timeline: "4–6 weeks",

  estimated_cost: "₹1,25,000 – ₹2,80,000",

  complexity: "Medium",

  why_hire_me:
    "Built using real-world product development experience with a focus on performance, usability, and long-term scalability.",

  deliverables: [
    "Modern dashboard for managing members and subscriptions",
    "Secure online payment integration",
    "Mobile-friendly experience for customers and staff",
    "Admin tools for tracking activity and business growth",
  ],

  next_steps: [
    "Quick discovery discussion",
    "Finalize project scope and timeline",
    "Begin development process",
  ],

  phases: [
    {
      name: "Planning & Design",
      duration: "1 week",
    },
    {
      name: "Core Development",
      duration: "3 weeks",
    },
    {
      name: "Payments & Dashboard",
      duration: "1 week",
    },
    {
      name: "Testing & Launch",
      duration: "1 week",
    },
  ],

  client_responsibilities: [
    "Provide branding assets and business details",
    "Share pricing structure and membership plans",
    "Review designs and provide timely feedback",
  ],

  risks: [
    {
      risk: "Payment setup delays",
      mitigation:
        "Using trusted providers and early integration planning to reduce delays.",
    },
  ],

  tech_stack: ["Next.js", "PostgreSQL", "Razorpay", "Tailwind CSS"],
};

export default function SampleProposalPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40 px-6 pb-12 pt-28">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[320px] w-[620px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20" />
        </div>

        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/5 px-3 py-1 text-xs font-medium text-blue-400">
            <Sparkles className="size-3.5" />
            Sample Proposal
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Example AI-generated{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              project proposal
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            This is a sample proposal generated using AI combined with real
            development experience. Your proposal will be tailored specifically
            to your business goals and requirements.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/get-quote"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Generate Your Proposal
              <ArrowRight className="size-3.5" />
            </Link>

            <Link
              href="/work"
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/50"
            >
              View Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Proposal */}
      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <QuoteClient quote={sampleProposal} id="sample-proposal" />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border/40 px-6 py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to generate one for your business?
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Get a personalized project proposal with realistic timelines,
            deliverables, and pricing tailored to your exact requirements.
          </p>

          <Link
            href="/get-quote"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Get Your Proposal
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
