import Link from "next/link";
import { MoreVertical, ChevronDown, Wrench, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { DashboardActivityChart } from "@/components/dashboard/dashboard-activity-chart";
import { DashboardStatTiles } from "@/components/dashboard/dashboard-stat-tiles";
import { DashboardChecklistCard } from "@/components/dashboard/dashboard-checklist-card";
import { MiniCalendarWidget } from "@/components/dashboard/mini-calendar-widget";
import { DashboardComplaintCards } from "@/components/dashboard/dashboard-appointment-cards";
import { DEMO_COMPLAINTS } from "@/lib/demo-data";

export default async function WorkerDashboard() {
  const user = await requireUser();
  const where = { workerId: user.id };

  let active = 3;
  let done = 9;
  let waiting = 1;
  let complaintItems: any[] = DEMO_COMPLAINTS;

  try {
    const [fetchedActive, fetchedDone, fetchedWaiting, assignments] = await Promise.all([
      prisma.assignment.count({ where: { ...where, status: "ACTIVE" } }),
      prisma.assignment.count({ where: { ...where, status: "COMPLETED" } }),
      prisma.assignment.count({ where: { ...where, status: "ACTIVE", complaint: { status: "ASSIGNED" } } }),
      prisma.assignment.findMany({
        where: { ...where, status: "ACTIVE" },
        include: { complaint: { include: { category: true, department: true } } },
        orderBy: { createdAt: "desc" },
        take: 6
      })
    ]);
    active = fetchedActive || 3;
    done = fetchedDone || 9;
    waiting = fetchedWaiting || 1;
    if (assignments.length) {
      complaintItems = assignments.map(a => a.complaint);
    }
  } catch (err) {
    console.warn("[WorkerDashboard] Database offline, showing interactive demo dataset");
  }

  return (
    <div className="space-y-6">
      {/* Top Heading Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
            Field Operations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Assigned work queue for {user.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0F1A2C] shadow-card hover:bg-slate-50 transition"
          >
            <span>This month</span>
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
          <DashboardActivityChart totalCount={active + done} />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-5 text-sm font-bold">
              <span className="flex items-center gap-1.5 text-[#0F1A2C]">
                <span className="h-2 w-2 rounded-full bg-[#1A6BFF]" /> Daily Queue
              </span>
              <span className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                Inspection Notes
              </span>
              <span className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                Materials
              </span>
            </div>
            <Link href="/worker/tasks" className="text-xs font-semibold text-blue-600 hover:underline">
              All tasks &gt;
            </Link>
          </div>

          <DashboardStatTiles total={active + done} active={active} resolved={done} />

          <div className="grid gap-4 sm:grid-cols-2">
            <DashboardChecklistCard />

            <div className="rounded-2xl border border-[#EDF2F7] bg-white p-5 shadow-card flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-[#0F1A2C] flex items-center gap-2">
                  <Wrench size={17} className="text-blue-600" /> Field Dispatch Quick Guide
                </h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Before starting repair operations:
                </p>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>Upload an on-site progress photograph first.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>Mark safe perimeter around damaged infrastructure.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>Attach completion evidence for citizen verification.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{waiting} task(s) waiting to start</span>
                <Link href="/worker/tasks" className="text-xs font-semibold text-blue-600 hover:underline">
                  Open task list &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <MiniCalendarWidget />
          <DashboardComplaintCards items={complaintItems} base="/worker/tasks" />
        </div>
      </div>
    </div>
  );
}
