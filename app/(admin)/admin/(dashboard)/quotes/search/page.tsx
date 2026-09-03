"use client";

import { useState } from "react";
import {
  Search,
  Link2,
  Copy,
  ExternalLink,
  FileText,
  Layers,
  History,
  CheckCircle2,
  Eye,
  Send,
  Clock3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SearchResult {
  quote: {
    id: string;
    name: string;
    email: string;
    project_type: string;
    status: string;
    slug: string | null;
    sent: boolean;
    created_at: string;
  };

  proposalDraft: {
    id: string;
    quote_id: string;
    status: string;
    estimated_cost: string;
    estimated_timeline: string;
    slug: string | null;
    sent: boolean;
    updated_at: string;
  } | null;

  proposalVersions: {
    id: string;
    version_number: number;
    status: string;
    slug: string | null;
    sent: boolean;
    sent_at: string | null;
    accepted_at: string | null;
    viewed_at: string | null;
    view_count: number;
  }[];

  proposalAcceptances: {
    client_name: string;
    accepted_at: string;
  }[];
}

export default function QuoteSearchPage() {
  const [quoteId, setQuoteId] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState<string | null>(null);

  async function sendEmail(
    type: "quote" | "draft" | "version",
    versionNumber?: number,
  ) {
    if (!result) return;

    const key = type === "version" ? `version-${versionNumber}` : type;

    setSending(key);

    try {
      const res = await fetch("/api/admin/proposals/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          quoteId: result.quote.id,
          versionNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success("Proposal email sent successfully.");

      await handleSearch(); // refresh sent badge
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send email.");
    } finally {
      setSending(null);
    }
  }

  async function handleSearch() {
    if (!quoteId.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/quotes/search?quoteId=${quoteId}`);

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  async function generateLink(
    type: "quote" | "draft" | "version",
    versionNumber?: number,
  ) {
    if (!result) return;

    const key = type === "version" ? `version-${versionNumber}` : type;

    setGenerating(key);

    try {
      const res = await fetch("/api/admin/proposals/generate-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          quoteId: result.quote.id,
          versionNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      await handleSearch();
      toast.success("Public link ready.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate link.",
      );
    } finally {
      setGenerating(null);
    }
  }

  function copyLink(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/proposal/${slug}`);
  }

  function openLink(slug: string) {
    window.open(`/proposal/${slug}`, "_blank");
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 pt-28 pb-12">
      {/* Header */}

      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Proposal Link Control Center</h1>

        <p className="text-muted-foreground">
          Search any Quote ID and manage every public proposal link from one
          place.
        </p>
      </div>

      {/* Search */}

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex gap-3">
            <Input
              placeholder="Paste Quote ID..."
              value={quoteId}
              onChange={(e) => setQuoteId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />

            <Button onClick={handleSearch} disabled={loading}>
              <Search className="mr-2 h-4 w-4" />

              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* QUOTE */}

          <EntityCard
            icon={<FileText className="h-6 w-6" />}
            title="Quote"
            subtitle={`${result.quote.name} • ${result.quote.project_type}`}
            generated={!!result.quote.slug}
            sent={result.quote.sent}
          >
            {result.quote.slug ? (
              <LinkSection
                slug={result.quote.slug}
                onCopy={() => copyLink(result.quote.slug!)}
                onOpen={() => openLink(result.quote.slug!)}
                extraAction={
                  <Button
                    size="sm"
                    onClick={() => sendEmail("quote")}
                    disabled={sending === "quote"}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {sending === "quote"
                      ? "Sending..."
                      : result.quote.sent
                        ? "Resend Email"
                        : "Send Email"}
                  </Button>
                }
              />
            ) : (
              <Button
                onClick={() => generateLink("quote")}
                disabled={generating === "quote"}
              >
                <Link2 className="mr-2 h-4 w-4" />

                {generating === "quote" ? "Generating..." : "Generate Link"}
              </Button>
            )}
          </EntityCard>

          {/* STATUS */}

          {/* DRAFT */}

          <EntityCard
            icon={<Layers className="h-6 w-6" />}
            title="Proposal Draft"
            subtitle={
              result.proposalDraft
                ? `${result.proposalDraft.estimated_cost} • ${result.proposalDraft.estimated_timeline}`
                : "No draft exists"
            }
            generated={!!result.proposalDraft?.slug}
            sent={result.proposalDraft?.sent ?? false}
          >
            {!result.proposalDraft ? (
              <p className="text-sm text-muted-foreground">
                No proposal draft exists yet.
              </p>
            ) : result.proposalDraft.slug ? (
              <LinkSection
                slug={result.proposalDraft.slug}
                onCopy={() => copyLink(result.proposalDraft!.slug!)}
                onOpen={() => openLink(result.proposalDraft!.slug!)}
                extraAction={
                  <Button
                    size="sm"
                    onClick={() => sendEmail("draft")}
                    disabled={sending === "draft"}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {sending === "draft"
                      ? "Sending..."
                      : result.proposalDraft.sent
                        ? "Resend Email"
                        : "Send Email"}
                  </Button>
                }
              />
            ) : (
              <Button
                onClick={() => generateLink("draft")}
                disabled={generating === "draft"}
              >
                <Link2 className="mr-2 h-4 w-4" />

                {generating === "draft" ? "Generating..." : "Generate Link"}
              </Button>
            )}
          </EntityCard>

          {/* VERSIONS */}

          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <History className="h-5 w-5" />
              Proposal Versions
            </h2>

            {result.proposalVersions.length === 0 && (
              <Card>
                <CardContent className="p-5 text-sm text-muted-foreground">
                  No proposal versions exist.
                </CardContent>
              </Card>
            )}

            {result.proposalVersions.map((version) => (
              <EntityCard
                key={version.id}
                icon={<Clock3 className="h-6 w-6" />}
                title={`Version ${version.version_number}`}
                subtitle={`Status: ${version.status}`}
                generated={!!version.slug}
                sent={version.sent}
              >
                <div className="space-y-4">
                  <StatusBadges
                    generated={Boolean(version.slug)}
                    sent={version.sent}
                    viewed={Boolean(version.viewed_at)}
                    views={version.view_count ?? 0}
                    accepted={Boolean(version.accepted_at)}
                  />

                  {version.slug ? (
                    <LinkSection
                      slug={version.slug!}
                      onCopy={() => copyLink(version.slug!)}
                      onOpen={() => openLink(version.slug!)}
                      extraAction={
                        <Button
                          size="sm"
                          onClick={() =>
                            sendEmail("version", version.version_number)
                          }
                          disabled={
                            sending === `version-${version.version_number}`
                          }
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {sending === `version-${version.version_number}`
                            ? "Sending..."
                            : version.sent
                              ? "Resend Email"
                              : "Send Email"}
                        </Button>
                      }
                    />
                  ) : (
                    <Button
                      onClick={() =>
                        generateLink("version", version.version_number)
                      }
                      disabled={
                        generating === `version-${version.version_number}`
                      }
                    >
                      <Link2 className="mr-2 h-4 w-4" />

                      {generating === `version-${version.version_number}`
                        ? "Generating..."
                        : "Generate Link"}
                    </Button>
                  )}
                </div>
              </EntityCard>
            ))}
          </div>

          {/* ACCEPTANCE HISTORY */}

          {result.proposalAcceptances.length > 0 && (
            <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
              <CardContent className="space-y-4 p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Acceptance History
                </h3>

                {result.proposalAcceptances.map((acceptance, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border bg-background p-4"
                  >
                    <div>
                      <p className="font-medium">{acceptance.client_name}</p>

                      <p className="text-sm text-muted-foreground">
                        Digitally accepted
                      </p>
                    </div>

                    <div className="text-right">
                      <Badge className="bg-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Accepted
                      </Badge>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(acceptance.accepted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */

function EntityCard({
  icon,
  title,
  subtitle,
  generated,
  sent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  generated: boolean;
  sent: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm transition hover:shadow-md">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="rounded-xl bg-muted p-3">{icon}</div>

            <div>
              <h3 className="text-lg font-semibold">{title}</h3>

              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          <StatusBadges
            generated={generated}
            sent={sent}
            viewed={false}
            views={0}
            accepted={false}
          />
        </div>

        {children}
      </CardContent>
    </Card>
  );
}

function StatusBadges({
  generated,
  sent,
  viewed,
  views,
  accepted,
}: {
  generated: boolean;
  sent: boolean;
  viewed: boolean;
  views: number;
  accepted: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {generated ? (
        <Badge className="bg-emerald-600 hover:bg-emerald-700">
          <Link2 className="mr-1 h-3 w-3" />
          Generated
        </Badge>
      ) : (
        <Badge variant="secondary">No Link</Badge>
      )}

      {sent && (
        <Badge className="bg-blue-600 hover:bg-blue-700">
          <Send className="mr-1 h-3 w-3" />
          Sent
        </Badge>
      )}

      {viewed && (
        <Badge variant="outline">
          <Eye className="mr-1 h-3 w-3" />
          Viewed ({views})
        </Badge>
      )}

      {accepted && (
        <Badge className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Accepted
        </Badge>
      )}
    </div>
  );
}

function LinkSection({
  slug,
  onCopy,
  onOpen,
  extraAction,
}: {
  slug: string;
  onCopy: () => void;
  onOpen: () => void;
  extraAction?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <code className="block rounded-lg bg-muted p-3 text-xs">
        /proposal/{slug}
      </code>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={onCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>

        <Button size="sm" onClick={onOpen}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open
        </Button>
        {extraAction}
      </div>
    </div>
  );
}
