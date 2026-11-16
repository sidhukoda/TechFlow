import Link from "next/link";
import { MoreVertical, ChevronDown, MapPin, ArrowRight } from "lucide-react";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { overview } from "@/services/analytics.service";
import { MapDisplay } from "@/components/maps/map-display";
import { DashboardActivityChart } from "@/components/dashboard/dashboard-activity-chart";
import { DashboardStatTiles } from "@/components/dashboard/dashboard-stat-tiles";
import { DashboardChecklistCard } from "@/components/dashboard/dashboard-checklist-card";
import { MiniCalendarWidget } from "@/components/dashboard/mini-calendar-widget";
import { DashboardComplaintCards } from "@/components/dashboard/dashboard-appointment-cards";
import { DEMO_COMPLAINTS, DEMO_OVERVIEW } from "@/lib/demo-data";

export default async function AdminDashboard() {
  const user = await requireUser([Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN]);
  const where = {
    deletedAt: null,
    ...(user.role === Role.DEPARTMENT_ADMIN ? { departmentId: user.departmentId ?? "" } : {})
  };

  let stats: any = DEMO_OVERVIEW;
  let items: any[] = DEMO_COMPLAINTS;

  try {
    const [fetchedStats, fetchedItems] = await Promise.all([
      overview(user),
      prisma.complaint.findMany({
        where,
        include: { category: true, department: true },
        orderBy: { createdAt: "desc" },
        take: 6
      })
    ]);
    stats = fetchedStats;
    items = fetchedItems.length ? fetchedItems : DEMO_COMPLAINTS;
  } catch (err) {
    console.warn("[AdminDashboard] Database offline, showing interactive demo dataset");
  }

  return (
    <div className="space-y-6">
      {/* Top Heading Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
            Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {user.role === Role.SUPER_ADMIN
              ? "Civic overview across all municipal departments"
              : `Department operations for ${user.departmentId ? "assigned jurisdiction" : "your team"}`}
          </p>
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
        {/* CENTER WORKSPACE */}
        <div className="space-y-6 min-w-0">
          <DashboardActivityChart totalCount={stats.total} />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-5 text-sm font-bold">
              <span className="flex items-center gap-1.5 text-[#0F1A2C]">
                <span className="h-2 w-2 rounded-full bg-[#1A6BFF]" /> Civic Health
              </span>
              <span className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                SLA Compliance
              </span>
              <span className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                Workload
              </span>
            </div>
            <Link href="/admin/complaints" className="text-xs font-semibold text-blue-600 hover:underline">
              All complaints &gt;
            </Link>
          </div>

          <DashboardStatTiles
            total={stats.total}
            active={stats.byStatus.IN_PROGRESS + stats.byStatus.ASSIGNED}
            resolved={stats.byStatus.RESOLVED + stats.byStatus.CLOSED}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <DashboardChecklistCard />

            <div className="rounded-2xl border border-[#EDF2F7] bg-white p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-base text-[#0F1A2C] flex items-center gap-2">
                  <MapPin size={17} className="text-blue-600" /> Incident Map
                </h3>
                <Link href="/admin/map" className="text-xs text-blue-600 font-semibold hover:underline">
                  Full map
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
                  base="/admin/complaints"
                  className="h-64 sm:h-72 w-full rounded-xl overflow-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT UTILITY SIDEBAR */}
        <div className="space-y-6">
          <MiniCalendarWidget />
          <DashboardComplaintCards items={items} base="/admin/complaints" />
        </div>
      </div>
    </div>
  );
}
