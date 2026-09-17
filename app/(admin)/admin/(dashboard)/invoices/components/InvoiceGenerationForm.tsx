"use client";

import { useMemo, useState } from "react";
import { Search, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

type InvoiceType = "advance" | "final" | "receipt";

interface QuoteData {
  id: string;
  clientName: string;
  clientEmail: string;
  company: string;
  projectType: string;
  summary: string;
  estimatedCost: string;
  estimatedTimeline: string;
  deliverables: string[];
  quoteUrl: string;
}

export function InvoiceGeneratorForm() {
  const [quoteId, setQuoteId] = useState("");
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("advance");
  const [advancePercent, setAdvancePercent] = useState(50);
  const [generating, setGenerating] = useState(false);

  const searchParams = useSearchParams();

  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split("T")[0];
  });

  const [quote, setQuote] = useState<QuoteData | null>(null);

  function parseAmount(value: string) {
    const number = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(number) ? number : 0;
  }

  async function fetchQuote() {
    if (!quoteId.trim()) {
      toast.error("Enter a Quote ID.");
      return;
    }

    try {
      setLoadingQuote(true);

      const res = await fetch(`/api/admin/invoices/quote/${quoteId.trim()}`);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setQuote(data.quote);

      toast.success("Quote loaded.");
    } catch (error) {
      setQuote(null);

      toast.error(
        error instanceof Error ? error.message : "Failed to fetch quote.",
      );
    } finally {
      setLoadingQuote(false);
    }
  }

  async function generateInvoicePdf() {
    if (!quote) {
      toast.error("Load a quote first.");
      return;
    }

    try {
      setGenerating(true);

      const response = await fetch("/api/admin/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteId: quote.id,
          type: invoiceType,
          advancePercent,
          currency: "INR",
          paymentMethod: "upi",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to generate invoice.");
      }

      const blob = await response.blob();

      const invoiceNumber =
        response.headers.get("X-Invoice-Number") ?? "invoice";

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = `${invoiceNumber}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);

      toast.success(`${invoiceNumber} generated successfully.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate invoice.",
      );
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    const id = searchParams.get("quote");

    if (!id) return;

    setQuoteId(id);

    fetch(`/api/admin/invoices/quote/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuote(data.quote);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const preview = useMemo(() => {
    const projectTotal = quote ? parseAmount(quote.estimatedCost) : 30000;

    switch (invoiceType) {
      case "advance": {
        const amount = Math.round((projectTotal * advancePercent) / 100);

        return {
          title: "Advance Invoice",
          amount,
          note: `Remaining ₹${(
            projectTotal - amount
          ).toLocaleString()} will be invoiced before project handover.`,
        };
      }

      case "final":
        return {
          title: "Final Invoice",
          amount: Math.round(projectTotal / 2),
          note: "Assumes a 50% advance has already been paid.",
        };

      case "receipt":
        return {
          title: "Paid Receipt",
          amount: projectTotal,
          note: "Shows payment received instead of payment due.",
        };
    }
  }, [quote, invoiceType, advancePercent]);

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      {/* Left */}

      <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Invoice Generator
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Generate invoices directly from an existing quote.
          </p>
        </div>

        {/* Quote ID */}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Quote ID
          </label>

          <div className="flex gap-3">
            <input
              value={quoteId}
              onChange={(e) => setQuoteId(e.target.value)}
              placeholder="Paste quote UUID..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <button
              onClick={fetchQuote}
              disabled={loadingQuote}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 transition hover:bg-accent disabled:opacity-60"
            >
              {loadingQuote ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}

              {loadingQuote ? "Loading..." : "Fetch"}
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            We&apos;ll automatically load the client, pricing and project
            details.
          </p>
        </div>

        {/* Quote Summary */}

        {quote && (
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {quote.clientName}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {quote.projectType}
                </p>
              </div>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {quote.estimatedCost}
              </span>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              {quote.summary}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {quote.deliverables.slice(0, 4).map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Document Type */}

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Document Type
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                value: "advance",
                label: "Advance Invoice",
              },
              {
                value: "final",
                label: "Final Invoice",
              },
              {
                value: "receipt",
                label: "Paid Receipt",
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setInvoiceType(option.value as InvoiceType)}
                className={`rounded-xl border p-4 text-left transition ${
                  invoiceType === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-accent"
                }`}
              >
                <div className="font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Advance Slider */}

        {invoiceType === "advance" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Advance Payment ({advancePercent}%)
            </label>

            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={advancePercent}
              onChange={(e) => setAdvancePercent(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* Due Date */}

        {invoiceType !== "receipt" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Due Date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        <button
          onClick={generateInvoicePdf}
          disabled={!quote || generating}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Generate Invoice
            </>
          )}
        </button>
      </div>

      {/* Right Preview */}

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>

        <div className="mt-6 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Client
            </p>

            <p className="mt-1 font-medium text-foreground">
              {quote?.clientName ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Project
            </p>

            <p className="mt-1 font-medium text-foreground">
              {quote?.projectType ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Document
            </p>

            <p className="mt-1 font-medium text-foreground">{preview.title}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Amount
            </p>

            <p className="mt-1 text-3xl font-bold text-primary">
              ₹{preview.amount.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">{preview.note}</p>
          </div>

          <div className="border-t border-border pt-5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Due Date</span>

              <span className="font-medium text-foreground">
                {invoiceType === "receipt" ? "Paid" : dueDate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
