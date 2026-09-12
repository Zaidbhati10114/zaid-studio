"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Building2,
  ArrowRight,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Campaign {
  id: string;
  name: string;
  city: string;
  niche: string;
  status: string;
  imported_count: number;
  created_at: string;
}

export default function LeadLabPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCampaigns();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  async function loadCampaigns() {
    try {
      const res = await fetch("/api/admin/lead-lab", {
        cache: "no-store",
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load campaigns.");
      }

      setCampaigns(data.campaigns ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCampaign() {
    if (!campaignToDelete) return;

    try {
      setDeleting(true);

      const res = await fetch(
        `/api/admin/lead-lab/campaign/${campaignToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to delete campaign.");
      }

      // Optimistic UI
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignToDelete.id));

      setCampaignToDelete(null);
    } catch (error) {
      console.error(error);
      alert("Failed to delete campaign.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <AlertDialog
        open={!!campaignToDelete}
        onOpenChange={(open) => !open && setCampaignToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete campaign?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-white">
                {campaignToDelete?.name}
              </span>
              , its import history, and generated outreach.
              <br />
              <br />
              Businesses and AI analysis will remain safely stored in your CRM.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={deleteCampaign}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete Campaign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <main className="mx-auto max-w-6xl space-y-8 px-6 pt-28 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lead Lab</h1>

            <p className="text-slate-500">Manage lead generation campaigns.</p>
          </div>

          <Link
            href="/admin/lead-lab/new"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-black hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-700 p-10 text-center">
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">
            <h2 className="text-lg font-semibold">No campaigns yet</h2>

            <p className="mt-2 text-slate-500">
              Create your first lead campaign.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="group relative rounded-2xl border border-border bg-card p-5 transition-all hover:bg-accent/40 hover:shadow-md"
              >
                <Link href={`/admin/lead-lab/${campaign.id}`} className="block">
                  <div className="mb-4 flex items-center justify-between pr-12">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {campaign.name}
                      </h3>

                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {campaign.city}
                        </span>

                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {campaign.niche}
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                    <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground capitalize">
                      {campaign.status}
                    </span>

                    <span className="text-muted-foreground">
                      {campaign.imported_count} leads
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Created {new Date(campaign.created_at).toLocaleDateString()}
                  </div>
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCampaignToDelete(campaign);
                  }}
                  className="absolute top-4 right-4 rounded-lg p-2 text-muted-foreground opacity-20 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
