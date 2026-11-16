import { Role } from "@prisma/client";
import { ClipboardList, AlertTriangle, Clock3, CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/permissions";
import * as analytics from "@/services/analytics.service";
import { AnalyticsCharts } from "@/components/charts/analytics-charts";

export default async function AnalyticsPage() {
  const user = await requireUser([Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN]);
  const [overview, monthly, categories, departments, workers] = await Promise.all([
    analytics.overview(user),
    analytics.monthly(user),
    analytics.categories(user),
    analytics.departments(user),
    analytics.workerWorkload(user)
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
          Analytics & Performance Reports
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time metrics, civic operational velocity, and workload distribution across all departments
        </p>
      </div>

      {/* 4 Hero Metric Tiles (Matching iMed Portal pastel + vibrant electric blue style) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Electric Blue Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-[#1A6BFF] p-5 text-white shadow-card transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
              <ClipboardList size={18} />
            </span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
              Total
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-blue-100">Total Reports</p>
            <p className="font-heading text-3xl font-bold text-white mt-0.5">
              {overview.total}
            </p>
          </div>
        </div>

        {/* Card 2: Soft Pastel Ice-Blue */}
        <div className="rounded-2xl border border-blue-100/60 bg-[#EEF5FE] p-5 text-[#0F1A2C] shadow-card transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-[#1A6BFF]">
              <Clock3 size={18} />
            </span>
            <span className="rounded-full bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold text-[#1A6BFF]">
              In Queue
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">Pending Review</p>
            <p className="font-heading text-3xl font-bold text-[#0F1A2C] mt-0.5">
              {overview.pending}
            </p>
          </div>
        </div>

        {/* Card 3: Soft Pastel Mint / Emerald */}
        <div className="rounded-2xl border border-emerald-100/60 bg-[#EDFAF1] p-5 text-[#0F1A2C] shadow-card transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={18} />
            </span>
            <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Velocity
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">Avg Resolution</p>
            <p className="font-heading text-3xl font-bold text-[#0F1A2C] mt-0.5">
              {overview.averageResolutionHours === null ? "N/A" : `${overview.averageResolutionHours}h`}
            </p>
          </div>
        </div>

        {/* Card 4: Soft Pastel Warm / Rose */}
        <div className="rounded-2xl border border-rose-100/60 bg-[#FEF2F2] p-5 text-[#0F1A2C] shadow-card transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={18} />
            </span>
            <span className="rounded-full bg-rose-100/80 px-2 py-0.5 text-[10px] font-bold text-rose-700">
              Attention
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">Overdue / SLA Risk</p>
            <p className="font-heading text-3xl font-bold text-[#0F1A2C] mt-0.5">
              {overview.overdue}
            </p>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Grid */}
      <AnalyticsCharts
        monthly={monthly}
        categories={categories}
        departments={departments}
        workers={workers}
        statuses={Object.entries(overview.byStatus).map(([name, count]) => ({
          name: name.replaceAll("_", " "),
          count
        }))}
      />
    </div>
  );
}
