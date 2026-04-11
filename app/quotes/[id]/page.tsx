import QuoteClient from "@/app/components/QuoteClient";
import { supabase } from "@/lib/supabase";

import { Link } from "lucide-react";

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

  return <QuoteClient quote={quote} id={id} />;
}
