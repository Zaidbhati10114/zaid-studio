"use client";

import Link from "next/link";
import { Calendar, MapPin, Building2, ArrowRight } from "lucide-react";

interface CampaignCardProps {
  id: string;
  name: string;
  city: string;
  niche: string;
  status: string;
  importedCount: number;
  createdAt: string;
}

export function CampaignCard({
  id,
  name,
  city,
  niche,
  status,
  importedCount,
  createdAt,
}: CampaignCardProps) {
  return (
    <Link
      href={`/admin/lead-lab/${id}`}
      className="group block rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 hover:bg-slate-850"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{name}</h3>

          <div className="mt-1 flex items-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {city}
            </span>

            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {niche}
            </span>
          </div>
        </div>

        <ArrowRight className="h-5 w-5 text-slate-500 transition group-hover:text-white" />
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-sm">
        <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300 capitalize">
          {status}
        </span>

        <span className="text-slate-400">{importedCount} leads</span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <Calendar className="h-3 w-3" />
        {new Date(createdAt).toLocaleDateString()}
      </div>
    </Link>
  );
}
