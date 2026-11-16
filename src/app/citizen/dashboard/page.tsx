import Link from "next/link";
import { MoreVertical, ChevronDown, Plus, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { MapDisplay } from "@/components/maps/map-display";
import { DashboardActivityChart } from "@/components/dashboard/dashboard-activity-chart";
import { DashboardStatTiles } from "@/components/dashboard/dashboard-stat-tiles";
import { DashboardChecklistCard } from "@/components/dashboard/dashboard-checklist-card";
import { MiniCalendarWidget } from "@/components/dashboard/mini-calendar-widget";
import { DashboardComplaintCards } from "@/components/dashboard/dashboard-appointment-cards";
import { DEMO_COMPLAINTS } from "@/lib/demo-data";

export default async function CitizenDashboard() {
  const user = await requireUser();
  const where = { citizenId: user.id, deletedAt: null };

  let total = 5;
  let active = 2;
  let resolved = 3;
  let items: any[] = DEMO_COMPLAINTS;

  try {
    const [fetchedTotal, fetchedActive, fetchedResolved, fetchedItems] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.count({ where: { ...where, status: { notIn: ["CLOSED", "REJECTED"] } } }),
      prisma.complaint.count({ where: { ...where, status: "RESOLVED" } }),
      prisma.complaint.findMany({
        where,
        include: { category: true, department: true },
        orderBy: { createdAt: "desc" },
        take: 6
      })
    ]);
    total = fetchedTotal || 5;
    active = fetchedActive || 2;
    resolved = fetchedResolved || 3;
    items = fetchedItems.length ? fetchedItems : DEMO_COMPLAINTS;
  } catch (err) {
    console.warn("[CitizenDashboard] Database offline, showing interactive demo dataset");
  }

  return (
    <div className="space-y-6">
      {/* Top Heading Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Welcome back, {user.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0F1A2C] shadow-card hover:bg-slate-50 transition"
          >
            <span>This year</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-card hover:bg-slate-50 transition"
            aria-label="More options"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid gap-6 lg:grid-cols-[1fr_330px] xl:grid-cols-[1fr_360px]">
        {/* CENTER COLUMN */}
        <div className="space-y-6 min-w-0">
          <DashboardActivityChart totalCount={total} />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-5 text-sm font-bold">
              <span className="flex items-center gap-1.5 text-[#0F1A2C]">
                <span className="h-2 w-2 rounded-full bg-[#1A6BFF]" /> Infrastructure
              </span>
              <span className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                Departments
              </span>
              <span className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                SLA Performance
              </span>
            </div>
            <Link href="/citizen/complaints" className="text-xs font-semibold text-blue-600 hover:underline">
              All data &gt;
            </Link>
          </div>

          <DashboardStatTiles total={total} active={active} resolved={resolved} />

          <div className="grid gap-4 sm:grid-cols-2">
            <DashboardChecklistCard />

            <div className="rounded-2xl border border-[#EDF2F7] bg-white p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-base text-[#0F1A2C] flex items-center gap-2">
                  <MapPin size={17} className="text-blue-600" /> Report Map
                </h3>
                <Link href="/citizen/complaints" className="text-xs text-blue-600 font-semibold hover:underline">
                  View full map
                </Link>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <MapDisplay
                  items={items.map(item => ({
                    id: item.id,
                    ticketNumber: item.ticketNumber,
                    title: item.title,
                    status: item.status,
                    latitude: item.latitude,
                    longitude: item.longitude
                  }))}
                  base="/citizen/complaints"
                  className="h-64 sm:h-72 w-full rounded-xl overflow-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <MiniCalendarWidget />
          <DashboardComplaintCards items={items} base="/citizen/complaints" />
        </div>
      </div>
    </div>
  );
}
