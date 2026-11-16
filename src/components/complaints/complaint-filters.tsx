"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/client-api";

type CategoryOption = { id: string; name: string };

export function ComplaintFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const status = params.get("status") || "";
  const categoryId = params.get("categoryId") || "";

  useEffect(() => {
    api<CategoryOption[]>("/api/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  function go(nextQ = q, nextStatus = status, nextCat = categoryId) {
    const p = new URLSearchParams();
    if (nextQ) p.set("q", nextQ);
    if (nextStatus) p.set("status", nextStatus);
    if (nextCat) p.set("categoryId", nextCat);
    router.push(`?${p}`);
  }

  function clearAll() {
    setQ("");
    router.push(window.location.pathname);
  }

  const hasFilters = Boolean(q || status || categoryId);

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={e => {
        e.preventDefault();
        go();
      }}
    >
      {/* Pill Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by ticket ID or title..."
          style={{ paddingLeft: "2.75rem" }}
          className="w-full rounded-xl border border-[#EDF2F7] bg-white py-2 pl-11 pr-4 text-xs font-medium text-slate-800 shadow-card placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Category Dropdown */}
      <div className="relative">
        <select
          className="w-full sm:w-48 appearance-none rounded-xl border border-[#EDF2F7] bg-white py-2 pl-3.5 pr-8 text-xs font-semibold text-[#0F1A2C] shadow-card hover:bg-slate-50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          value={categoryId}
          onChange={e => go(q, status, e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-2.5 text-[10px] text-slate-400">▼</span>
      </div>

      {/* Status Dropdown */}
      <div className="relative">
        <select
          className="w-full sm:w-40 appearance-none rounded-xl border border-[#EDF2F7] bg-white py-2 pl-3.5 pr-8 text-xs font-semibold text-[#0F1A2C] shadow-card hover:bg-slate-50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          value={status}
          onChange={e => go(q, e.target.value, categoryId)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {["SUBMITTED", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED", "REJECTED"].map(
            s => (
              <option value={s} key={s}>
                {s.replaceAll("_", " ")}
              </option>
            )
          )}
        </select>
        <span className="pointer-events-none absolute right-3 top-2.5 text-[10px] text-slate-400">▼</span>
      </div>

      {/* Search Action Button */}
      <Button
        type="submit"
        className="rounded-xl bg-[#1A6BFF] hover:bg-[#1557D0] text-white font-bold text-xs px-4 py-2 h-auto shadow-sm flex items-center justify-center gap-1.5 transition shrink-0"
      >
        <Search size={14} />
        <span>Search</span>
      </Button>

      {/* Reset Filter Button */}
      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-card hover:bg-slate-50 hover:text-slate-800 transition shrink-0"
        >
          <X size={13} />
          <span>Reset</span>
        </button>
      )}
    </form>
  );
}
