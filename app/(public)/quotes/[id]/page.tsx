import * as Sentry from "@sentry/nextjs";
import { supabase } from "@/lib/supabase";
import QuotePageClient from "@/app/components/QuotePageClient";
import Link from "next/link";

export const revalidate = 600;

export default async function QuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    Sentry.captureException(error, {
      tags: { layer: "quote_fetch", operation: "select_quote" },
      extra: { quoteId: id },
    });
  }

  if (error || !quote) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-lg font-medium">Proposal not found</p>
        <p className="text-sm text-muted-foreground">
          This link may be invalid or expired.
        </p>
        <Link href="/get-quote" className="text-blue-500 underline">
          Generate a New Quote
        </Link>
      </div>
    );
  }

  // Pass the DB data as a fallback — client will use cache if available
  return <QuotePageClient id={id} fallbackQuote={quote} />;
}
