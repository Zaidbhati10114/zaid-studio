"use client";

import { useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { CampaignProvider, useCampaign } from "../components/CampaignProvider";

import { BusinessDetailDrawer } from "../components/BusinessDetailDrawer";
import ImportButton from "../components/ImportButton";
import ImportConsole from "../components/ImportConsole";

export default function CampaignPage() {
  const params = useParams();

  return (
    <CampaignProvider campaignId={params.id as string}>
      <CampaignWorkspace />
    </CampaignProvider>
  );
}

function CampaignWorkspace() {
  const {
    campaign,
    filteredBusinesses,
    businesses,
    loading,
    logs,
    filter,
    setFilter,
  } = useCampaign();

  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedBusinessId = searchParams.get("business");

  const selectedBusiness = useMemo(
    () =>
      filteredBusinesses.find(
        (business) => business.id === selectedBusinessId,
      ) ?? null,
    [filteredBusinesses, selectedBusinessId],
  );

  const stats = useMemo(() => {
    return {
      imported: businesses.length,
      contacted: businesses.filter((b) => b.status === "contacted").length,
      replied: businesses.filter((b) => b.status === "replied").length,
    };
  }, [businesses]);

  function openBusiness(id: string) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("business", id);

    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  }

  function closeDrawer() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("business");

    const query = params.toString();

    router.replace(query ? `?${query}` : "?", {
      scroll: false,
    });
  }

  return (
    <div className="space-y-6">
      {/* Campaign Header */}

      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-6">
        <div>
          <h1 className="text-2xl font-bold">{campaign?.name ?? "Campaign"}</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {campaign?.city ?? "City"} • {campaign?.niche ?? "Niche"}
          </p>
        </div>

        {campaign && (
          <ImportButton
            campaignId={campaign.id}
            city={campaign.city}
            niche={campaign.niche}
          />
        )}
      </div>

      {/* Live Import Console */}

      {logs.length > 0 && <ImportConsole />}

      {/* Workspace */}

      <div className="flex gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        {/* Left Panel */}

        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="space-y-4 border-b border-border p-5">
            <div>
              <h2 className="text-xl font-semibold">Campaign Leads</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {stats.imported} imported • {stats.contacted} contacted •{" "}
                {stats.replied} replied
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All" },
                { key: "noWebsite", label: "No Website" },
                { key: "new", label: "New" },
                { key: "contacted", label: "Contacted" },
                { key: "replied", label: "Replied" },
                { key: "won", label: "Won" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key as typeof filter)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    filter === item.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading businesses...
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Import businesses to start outreach.
            </div>
          ) : (
            <div className="flex-1 divide-y divide-border overflow-y-auto">
              {filteredBusinesses.map((business) => (
                <button
                  key={business.id}
                  onClick={() => openBusiness(business.id)}
                  className={`w-full p-5 text-left transition hover:bg-accent ${
                    selectedBusinessId === business.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{business.name}</h3>

                      <p className="text-sm text-muted-foreground">
                        {business.primaryType}
                        {business.city && ` • ${business.city}`}
                      </p>
                    </div>

                    {business.inspection && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          business.inspection.priority === "high"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : business.inspection.priority === "medium"
                              ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                              : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                        }`}
                      >
                        {business.inspection.score}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Drawer */}

        <div className="flex w-[430px] flex-col overflow-hidden rounded-xl border border-border bg-card">
          {selectedBusiness ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4 flex justify-end">
                <button
                  onClick={closeDrawer}
                  className="rounded-md border border-border bg-background px-3 py-1 text-sm transition hover:bg-accent"
                >
                  Close
                </button>
              </div>

              <BusinessDetailDrawer business={selectedBusiness} />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
              Select a business to review AI insights and generate outreach.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
