import Link from "next/link";
import { ArrowRight, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-2 text-sm text-blue-400">
          <Sparkles className="size-4" />
          Page Not Found
        </div>

        {/* 404 */}
        <div className="mt-8">
          <h1 className="bg-gradient-to-r from-white to-blue-500 bg-clip-text text-7xl font-bold tracking-tight text-transparent sm:text-8xl">
            404
          </h1>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            This page doesn&apos;t exist
          </h2>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            The page you&apos;re looking for may have been moved, removed, or
            the link might be incorrect.
          </p>
        </div>

        {/* Info Card */}
        <div className="mt-8 rounded-2xl border border-border/50 bg-card/20 p-5 text-left backdrop-blur-sm">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Looking for a project estimate? Generate a personalized proposal in
            under a minute using the AI Proposal Generator.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Home className="size-4" />
            Back Home
          </Link>

          <Link
            href="/get-quote"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/50 px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary/50"
          >
            Generate Proposal
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-muted-foreground">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </main>
  );
}
