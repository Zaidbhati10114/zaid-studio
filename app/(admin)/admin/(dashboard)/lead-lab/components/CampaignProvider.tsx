"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface ImportLogEntry {
  id: number;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

type LeadFilter = "all" | "noWebsite" | "new" | "contacted" | "replied" | "won";

interface CampaignContextValue {
  campaign: any;
  businesses: any[];
  filteredBusinesses: any[];
  importJobs: any[];

  filter: LeadFilter;
  setFilter: React.Dispatch<React.SetStateAction<LeadFilter>>;
  logs: ImportLogEntry[];
  updateBusinessStatus: (
    leadId: string,
    status: "new" | "contacted" | "replied" | "won" | "lost",
  ) => void;

  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;

  loading: boolean;

  refresh: () => Promise<void>;
  addLog: (log: Omit<ImportLogEntry, "id">) => void;
  clearLogs: () => void;
}

const CampaignContext = createContext<CampaignContextValue | null>(null);

export function CampaignProvider({
  campaignId,
  children,
}: {
  campaignId: string;
  children: React.ReactNode;
}) {
  const [campaign, setCampaign] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [importJobs, setImportJobs] = useState<any[]>([]);
  const [logs, setLogs] = useState<ImportLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LeadFilter>("all");

  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/lead-lab/campaign/${campaignId}`, {
        cache: "no-store",
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load campaign.");
      }

      setCampaign(data.campaign);
      setBusinesses(data.businesses ?? []);
      setImportJobs(data.importJobs ?? []);
    } catch (error) {
      console.error("Campaign refresh failed:", error);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  // React 19-safe initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh();
    }, 0);

    return () => clearTimeout(timer);
  }, [refresh]);

  const updateBusinessStatus = useCallback(
    (
      leadId: string,
      status: "new" | "contacted" | "replied" | "won" | "lost",
    ) => {
      setBusinesses((prev) =>
        prev.map((business) =>
          business.leadId === leadId ? { ...business, status } : business,
        ),
      );
    },
    [],
  );

  const addLog = useCallback((log: Omit<ImportLogEntry, "id">) => {
    setLogs((prev) => [
      ...prev,
      {
        ...log,
        id: Date.now() + Math.random(),
      },
    ]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const filteredBusinesses = useMemo(() => {
    let list = businesses;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();

      list = list.filter((business) => business.name.toLowerCase().includes(q));
    }

    // Filters
    switch (filter) {
      case "noWebsite":
        return list.filter((b) => !b.website);

      case "new":
        return list.filter((b) => b.status === "new");

      case "contacted":
        return list.filter((b) => b.status === "contacted");

      case "replied":
        return list.filter((b) => b.status === "replied");

      case "won":
        return list.filter((b) => b.status === "won");

      default:
        return list;
    }
  }, [businesses, search, filter]);

  return (
    <CampaignContext.Provider
      value={{
        filter,
        setFilter,
        campaign,
        businesses,
        filteredBusinesses,
        importJobs,
        updateBusinessStatus,

        logs,

        search,
        setSearch,

        loading,

        refresh,
        addLog,
        clearLogs,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);

  if (!context) {
    throw new Error("useCampaign must be used inside CampaignProvider.");
  }

  return context;
}
