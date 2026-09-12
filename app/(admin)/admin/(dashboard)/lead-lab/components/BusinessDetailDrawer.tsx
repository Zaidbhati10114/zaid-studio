"use client";

import { useEffect, useState } from "react";
import { useCampaign } from "./CampaignProvider";

interface Inspection {
  score: number;
  priority: "high" | "medium" | "low";

  leadScore: number;
  leadScoreReason: string;
  businessInsight: string;
  painPoint: string;

  bestApproach: string;
  servicesToPitch: string[];
  bestContactMethod: string;
  openingLine: string;

  objectionPrediction: string;
  closingAngle: string;

  websiteFindings: string[];
  outreachAngle: string;

  evidence?: {
    title?: string | null;
    metaDescription?: string | null;
    h1?: string | null;
    hasContactPage?: boolean;
    hasBookingButton?: boolean;
    hasOrderButton?: boolean;
    hasInstagram?: boolean;
    hasFacebook?: boolean;
    hasWhatsApp?: boolean;
    hasPhoneNumber?: boolean;
    hasEmail?: boolean;
    pageLength?: number;
  };
}

interface OutreachResult {
  email: {
    subject: string;
    body: string;
  };
  whatsapp: string;
  linkedin: string;
}

interface Props {
  business: {
    id: string;
    leadId: string;

    name: string;
    primaryType: string | null;
    city?: string;

    website: string | null;
    phone: string | null;

    status: "new" | "contacted" | "replied" | "won" | "lost";

    inspection?: Inspection | null;

    outreach?: OutreachResult | null;
  };
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "replied", label: "Replied" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
] as const;

export function BusinessDetailDrawer({ business }: Props) {
  const { updateBusinessStatus } = useCampaign();

  const [inspection, setInspection] = useState<Inspection | null>(
    business.inspection ?? null,
  );

  const [outreach, setOutreach] = useState<OutreachResult | null>(
    business.outreach ?? null,
  );

  const [status, setStatus] = useState<
    "new" | "contacted" | "replied" | "won" | "lost"
  >(business.status);

  const [loadingInspection, setLoadingInspection] = useState(false);
  const [loadingOutreach, setLoadingOutreach] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    setInspection(business.inspection ?? null);
    setOutreach(business.outreach ?? null);
    setStatus(business.status);
  }, [business]);

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  async function handleAnalyze() {
    setLoadingInspection(true);

    try {
      const response = await fetch("/api/admin/lead-lab/inspect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId: business.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to analyze lead.");
      }

      setInspection(data.inspection);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingInspection(false);
    }
  }

  async function handleGenerate() {
    if (!inspection) return;

    setLoadingOutreach(true);

    try {
      const response = await fetch("/api/admin/lead-lab/generate-outreach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignLeadId: business.leadId,

          businessName: business.name,
          category: business.primaryType,
          city: business.city,

          evidence: inspection.evidence ?? {},
          websiteFindings: inspection.websiteFindings,
          outreachAngle: inspection.outreachAngle,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to generate outreach.");
      }

      setOutreach(data.outreach);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOutreach(false);
    }
  }

  async function handleStatusChange(nextStatus: typeof status) {
    setStatus(nextStatus);
    updateBusinessStatus(business.leadId, nextStatus);

    setUpdatingStatus(true);

    try {
      await fetch(`/api/admin/lead-lab/lead/${business.leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold">{business.name}</h2>

          <p className="text-sm text-muted-foreground">
            {business.primaryType}
            {business.city && ` • ${business.city}`}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            Lead Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              handleStatusChange(e.target.value as typeof status)
            }
            disabled={updatingStatus}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analyze */}

      {!inspection ? (
        <div className="rounded-xl border p-5 space-y-4">
          <div>
            <h3 className="font-semibold">AI Lead Analysis</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Run AI once and cache the analysis for future visits.
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loadingInspection}
            className="w-full rounded-lg bg-black px-4 py-3 text-white disabled:opacity-50"
          >
            {loadingInspection ? "Analyzing..." : "Analyze Lead"}
          </button>
        </div>
      ) : (
        <>
          {/* Call Brief */}

          <div className="rounded-xl border p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Call Brief</h3>

                <p className="text-sm text-muted-foreground">
                  20-second AI sales briefing
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold">{inspection.leadScore}/100</p>

                <p className="text-xs text-muted-foreground">
                  {inspection.leadScoreReason}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Best Contact</p>

                <p className="font-medium">{inspection.bestContactMethod}</p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Priority</p>

                <p className="font-medium capitalize">{inspection.priority}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Business Insight
              </p>

              <p className="text-sm">{inspection.businessInsight}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Biggest Opportunity
              </p>

              <p className="text-sm">{inspection.painPoint}</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Opening Line
                </p>

                <button
                  onClick={() => copyText(inspection.openingLine)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Copy
                </button>
              </div>

              <p className="mt-2 text-sm italic">"{inspection.openingLine}"</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Services to Pitch
              </p>

              <div className="flex flex-wrap gap-2">
                {inspection.servicesToPitch.map((service) => (
                  <span
                    key={service}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Likely Objection
              </p>

              <p className="text-sm">{inspection.objectionPrediction}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Closing Angle
              </p>

              <p className="text-sm">{inspection.closingAngle}</p>
            </div>
          </div>

          {/* Website Evidence */}

          {inspection.websiteFindings.length > 0 && (
            <div className="rounded-xl border p-5 space-y-3">
              <h3 className="font-semibold">Website Evidence</h3>

              <ul className="list-disc pl-5 space-y-2 text-sm">
                {inspection.websiteFindings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Outreach */}

          {!outreach && (
            <button
              onClick={handleGenerate}
              disabled={loadingOutreach}
              className="w-full rounded-lg bg-black px-4 py-3 text-white disabled:opacity-50"
            >
              {loadingOutreach ? "Generating..." : "Generate Outreach"}
            </button>
          )}

          {outreach && (
            <div className="space-y-4">
              {[
                {
                  title: "Email",
                  content: `Subject: ${outreach.email.subject}\n\n${outreach.email.body}`,
                },
                {
                  title: "WhatsApp",
                  content: outreach.whatsapp,
                },
                {
                  title: "LinkedIn",
                  content: outreach.linkedin,
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">{item.title}</h3>

                    <button
                      onClick={() => copyText(item.content)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Copy
                    </button>
                  </div>

                  <pre className="whitespace-pre-wrap text-sm">
                    {item.content}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
