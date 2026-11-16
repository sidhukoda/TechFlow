"use client";

import Link from "next/link";
import { MoreVertical, Wrench, Droplets, Trash2, Lightbulb, Building2, Clock, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ComplaintItem = {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  createdAt: Date | string;
  address?: string;
  category: { name: string; slug?: string };
  department: { name: string; slug?: string };
};

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  roads: Wrench,
  water: Droplets,
  sanitation: Trash2,
  electrical: Lightbulb,
  "public-works": Building2
};

export function DashboardComplaintCards({
  items = [],
  base = "/citizen/complaints"
}: {
  items: ComplaintItem[];
  base?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-base text-[#0F1A2C]">Recent Complaints</h3>
        <Link href={base} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
          See all <ArrowRight size={12} />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-xs text-slate-400">
          No complaints active right now.
        </div>
      ) : (
        items.slice(0, 3).map(item => {
          const deptSlug = item.department?.slug || "";
          const Icon = iconMap[deptSlug] || Wrench;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[#EDF2F7] bg-white p-4 shadow-card transition-all hover:shadow-floating"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`${base}/${item.id}`}
                      className="font-bold text-sm text-[#0F1A2C] hover:text-blue-600 truncate block"
                    >
                      {item.title}
                    </Link>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Clock size={11} /> {item.ticketNumber}
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 mt-1 truncate">
                      {item.department.name}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <button type="button" className="text-slate-400 hover:text-slate-600 p-0.5">
                    <MoreVertical size={15} />
                  </button>
                  <Badge value={item.status} className="text-[10px] py-0 px-2" />
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Treatment / Resolution Evidence pill card (Matching bottom right in image) */}
      <div className="rounded-2xl border border-[#EDF2F7] bg-white p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Public Works SLA</p>
          <span className="text-[11px] font-semibold text-blue-600">Active policy</span>
        </div>
        <div className="flex items-center gap-3 mt-2 rounded-xl bg-[#EEF4FE] p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
            24h
          </div>
          <div>
            <p className="text-xs font-bold text-[#0F1A2C]">Standard Response SLA</p>
            <p className="text-[10px] text-slate-500">Critical issues dispatched within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
