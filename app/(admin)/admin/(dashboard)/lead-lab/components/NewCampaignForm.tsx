"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NewCampaignForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    city: "",
    niche: "",
    radius: 5,
    maxResults: 50,
  });

  const estimatedRequests = 1 + form.maxResults;

  async function createCampaign() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/lead-lab/campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success("Campaign created.");

      router.push(`/admin/lead-lab/${data.campaign.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create campaign.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            New Campaign
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Create a lead campaign before importing businesses.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">
            Campaign Name
          </label>

          <input
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Mumbai Restaurants September"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">City</label>

            <input
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Mumbai"
              value={form.city}
              onChange={(e) =>
                setForm({
                  ...form,
                  city: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Niche</label>

            <input
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Restaurant"
              value={form.niche}
              onChange={(e) =>
                setForm({
                  ...form,
                  niche: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">
              Radius (km)
            </label>

            <input
              type="number"
              min={1}
              max={50}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={form.radius}
              onChange={(e) =>
                setForm({
                  ...form,
                  radius: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Max Results
            </label>

            <input
              type="number"
              min={10}
              max={100}
              step={10}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={form.maxResults}
              onChange={(e) =>
                setForm({
                  ...form,
                  maxResults: Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <button
          onClick={createCampaign}
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Campaign"}
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">Credit Preview</h3>

        <div className="mt-5 space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Text Search</span>
            <span className="text-foreground">1 request</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Place Details</span>
            <span className="text-foreground">{form.maxResults} requests</span>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex justify-between font-medium">
              <span className="text-foreground">Estimated Total</span>

              <span className="text-primary">≈{estimatedRequests}</span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              We'll automatically skip businesses that already exist in your
              CRM, so duplicate leads won't consume additional imports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
