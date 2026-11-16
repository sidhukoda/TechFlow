import Link from "next/link";
import { ComplaintStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { MapDisplay } from "@/components/maps/map-display";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowUpRight, Filter } from "lucide-react";

export default async function MapPage({
  searchParams
}: {
  searchParams: Promise<{ categoryId?: string; status?: string }>;
}) {
  const user = await requireUser([Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN]);
  const params = await searchParams;
  const departmentScope =
    user.role === Role.DEPARTMENT_ADMIN ? { departmentId: user.departmentId ?? "" } : {};
  const where: Prisma.ComplaintWhereInput = {
    deletedAt: null,
    ...departmentScope,
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.status && Object.values(ComplaintStatus).includes(params.status as ComplaintStatus)
      ? { status: params.status as ComplaintStatus }
      : {})
  };

  const [items, categories] = await Promise.all([
    prisma.complaint.findMany({
      where,
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        status: true,
        latitude: true,
        longitude: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 500
    }),
    prisma.category.findMany({ where: departmentScope, orderBy: { name: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
            Infrastructure Issue Map
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic overview of reported incidents across municipal boundaries ({items.length} mapped reports)
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <form
        method="GET"
        className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-2xl border border-[#EDF2F7] bg-white p-4 shadow-card"
      >
        <div className="relative flex-1">
          <select
            name="categoryId"
            defaultValue={params.categoryId || ""}
            aria-label="Filter by category"
            className="w-full appearance-none rounded-xl border border-slate-200/90 bg-white py-2 pl-3.5 pr-8 text-xs font-semibold text-[#0F1A2C] shadow-sm hover:bg-slate-50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
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

        <div className="relative flex-1">
          <select
            name="status"
            defaultValue={params.status || ""}
            aria-label="Filter by status"
            className="w-full appearance-none rounded-xl border border-slate-200/90 bg-white py-2 pl-3.5 pr-8 text-xs font-semibold text-[#0F1A2C] shadow-sm hover:bg-slate-50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="">All Statuses</option>
            {Object.values(ComplaintStatus).map(s => (
              <option value={s} key={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-2.5 text-[10px] text-slate-400">▼</span>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0A1120] px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#162238]"
        >
          <Filter size={13} />
          <span>Apply Filter</span>
        </button>

        {(params.categoryId || params.status) && (
          <Link
            href="/admin/map"
            className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2"
          >
            Reset
          </Link>
        )}
      </form>

      {/* Map Card with Legend */}
      <div className="overflow-hidden rounded-2xl border border-[#EDF2F7] bg-white shadow-card p-4 space-y-3">
        {/* Map Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-slate-600">
              <span className="h-3 w-3 rounded-full bg-[#EF4444] shadow-sm" />
              <span>Open / Under Review</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-600">
              <span className="h-3 w-3 rounded-full bg-[#1A6BFF] shadow-sm" />
              <span>Assigned / In Progress</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-600">
              <span className="h-3 w-3 rounded-full bg-[#10B981] shadow-sm" />
              <span>Resolved</span>
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            Click pins to inspect incident &bull; Google Maps View
          </span>
        </div>

        <MapDisplay items={items} base="/admin/complaints" className="h-[460px] sm:h-[540px] w-full rounded-xl overflow-hidden border border-slate-100 shadow-inner" />
      </div>

      {/* Recent Incident Feed */}
      <div className="rounded-2xl border border-[#EDF2F7] bg-white shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-bold text-[#0F1A2C] flex items-center gap-2">
            <MapPin size={17} className="text-blue-600" /> Nearby Incidents Feed
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Showing top {Math.min(items.length, 15)} active pin locations
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 15).map(item => (
            <Link
              key={item.id}
              href={`/admin/complaints/${item.id}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-[#EDF2F7] bg-[#F8FAFD] p-3.5 transition hover:bg-white hover:shadow-card hover:border-blue-200"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-[#0F1A2C] group-hover:text-blue-600 transition truncate">
                  {item.title}
                </p>
                <p className="mt-0.5 font-mono text-[11px] font-semibold text-blue-600">
                  {item.ticketNumber}
                </p>
              </div>
              <Badge value={item.status} />
            </Link>
          ))}

          {items.length === 0 && (
            <p className="col-span-full py-8 text-center text-xs text-slate-400">
              No reports match your current filter criteria.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
