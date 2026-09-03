"use client";

import { useState } from "react";
import { ShieldCheck, PenLine, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  slug: string;
  onAccepted: (acceptedAt: string) => void;
}

export default function AcceptanceForm({ slug, onAccepted }: Props) {
  const [clientName, setClientName] = useState("");
  const [companyRole, setCompanyRole] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    setError("");

    if (!clientName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!agreed) {
      setError("Please accept the agreement before continuing.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/proposal/${slug}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_name: clientName.trim(),
          company_role: companyRole.trim(),
          agreed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Unable to accept proposal.");
      }

      onAccepted(data.acceptedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="space-y-6 p-8">
        {/* Header */}

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-green-600" />

            <h2 className="text-2xl font-bold">Digital Approval</h2>
          </div>

          <p className="text-muted-foreground">
            Type your full name to digitally approve this proposal. No
            handwritten signature is required.
          </p>
        </div>

        {/* Signature Box */}

        <div className="rounded-2xl border bg-muted/20 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <PenLine className="h-4 w-4" />
            Digital Signature
          </div>

          <Input
            placeholder="Full Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="h-12 text-lg font-medium"
          />

          <div className="rounded-lg border border-dashed p-4 bg-background">
            <p className="font-serif text-2xl italic text-center min-h-[36px]">
              {clientName || "Your name will appear here"}
            </p>
          </div>

          <Input
            placeholder="Company Role (optional)"
            value={companyRole}
            onChange={(e) => setCompanyRole(e.target.value)}
            className="h-11"
          />
        </div>

        {/* Agreement */}

        <div className="rounded-xl border bg-muted/20 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(Boolean(checked))}
              className="mt-1"
            />

            <div className="space-y-2">
              <p className="font-medium leading-6">
                I have reviewed and agree to this proposal.
              </p>

              <p className="text-sm text-muted-foreground leading-6">
                By clicking **Accept Proposal**, I confirm that I accept the
                project scope, payment terms, support policy and ownership terms
                presented in this proposal.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/20">
            {error}
          </div>
        )}

        {/* CTA */}

        <div className="space-y-4 md:sticky md:bottom-6">
          <Button
            onClick={handleAccept}
            disabled={loading}
            className="h-12 w-full text-base font-semibold"
          >
            {loading ? "Recording Acceptance..." : "Accept Proposal"}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Your acceptance is securely recorded with a timestamp.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
