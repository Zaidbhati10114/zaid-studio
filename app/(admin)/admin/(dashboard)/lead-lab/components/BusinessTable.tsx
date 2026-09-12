"use client";

import { Search, Globe, Phone } from "lucide-react";
import { useCampaign } from "./CampaignProvider";

export default function BusinessTable() {
  const { businesses, search, setSearch } = useCampaign();

  const filtered = businesses.filter((business: any) => {
    const text = search.toLowerCase();

    return (
      business.name.toLowerCase().includes(text) ||
      business.address.toLowerCase().includes(text)
    );
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="font-medium text-white">
            Business Directory ({filtered.length})
          </h2>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">Business</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Rating</th>
              <th className="px-4 py-3 text-left">Reviews</th>
              <th className="px-4 py-3 text-left">Website</th>
              <th className="px-4 py-3 text-left">Phone</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No businesses found.
                </td>
              </tr>
            ) : (
              filtered.map((business: any) => (
                <tr key={business.id} className="border-b border-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">
                      {business.name}
                    </div>

                    <div className="text-xs text-slate-500">
                      {business.address}
                    </div>
                  </td>

                  <td className="px-4 py-3 capitalize text-slate-300">
                    {business.primary_type ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-slate-300">
                    {business.rating ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-slate-300">
                    {business.review_count ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    {business.website ? (
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Visit
                      </a>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {business.phone ? (
                      <a
                        href={`tel:${business.phone}`}
                        className="inline-flex items-center gap-1 text-green-400 hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </a>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
