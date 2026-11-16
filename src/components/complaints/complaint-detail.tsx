import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Tag,
  UserRound,
  CheckCircle2,
  Clock,
  Building2,
  ImageIcon,
  Sparkles
} from "lucide-react";
import { MapDisplay } from "@/components/maps/map-display";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, readable } from "@/lib/utils";
import { ComplaintActions } from "@/components/complaints/complaint-actions";
import { ResolutionReviewActions } from "@/components/complaints/resolution-review-actions";

type EvidenceImage = { id: string; kind: string; secureUrl: string };
type History = {
  id: string;
  toStatus: string;
  remarks: string | null;
  createdAt: Date;
  actor: { name: string; role: string };
};

export type Detail = {
  id: string;
  departmentId: string;
  ticketNumber: string;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  priority: string;
  dueAt: Date | null;
  createdAt: Date;
  resolutionApprovedAt: Date | null;
  category: { name: string };
  department: { name: string };
  images: EvidenceImage[];
  history: History[];
  assignments: { id: string; status: string; worker: { id: string; name: string } }[];
  feedback: { rating: number; comment: string | null } | null;
  _count: { supports: number };
};

export function ComplaintDetail({
  item,
  role
}: {
  item: Detail;
  role: "citizen" | "admin" | "worker";
}) {
  const listHref = role === "worker" ? "/worker/tasks" : `/${role}/complaints`;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href={listHref}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-card transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          <span>Back to {role === "worker" ? "tasks" : role === "citizen" ? "reports" : "complaints"}</span>
        </Link>
      </div>

      {/* Header Banner Card */}
      <section className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600">
                {item.ticketNumber}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {item.department.name}
              </span>
            </div>

            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Tag size={13} className="text-blue-600" />
                {item.category.name}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CalendarDays size={13} className="text-blue-600" />
                {formatDate(item.createdAt)}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin size={13} className="text-blue-600" />
                {item.address}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge value={item.status} />
            <Badge value={item.priority} />
          </div>
        </div>
      </section>

      {/* Main Grid: Details + Actions */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Issue Description */}
          <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
            <h2 className="font-heading text-base font-bold text-[#0F1A2C]">
              Issue Description
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-slate-600">
              {item.description}
            </p>

            <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Priority
                </p>
                <p className="mt-1 text-xs font-bold text-[#0F1A2C]">
                  {readable(item.priority)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Department
                </p>
                <p className="mt-1 text-xs font-bold text-[#0F1A2C] truncate">
                  {item.department.name}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Target Resolution
                </p>
                <p className="mt-1 text-xs font-bold text-[#0F1A2C]">
                  {item.dueAt ? formatDate(item.dueAt) : "Standard SLA"}
                </p>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-base font-bold text-[#0F1A2C] flex items-center gap-2">
                <MapPin size={17} className="text-blue-600" /> Location
              </h2>
              <span className="text-xs text-slate-400">{item.address}</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100">
              <MapDisplay
                items={[
                  {
                    id: item.id,
                    ticketNumber: item.ticketNumber,
                    title: item.title,
                    status: item.status,
                    latitude: item.latitude,
                    longitude: item.longitude
                  }
                ]}
                base={listHref}
              />
            </div>
          </div>

          {/* Photographs Gallery */}
          <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-heading text-base font-bold text-[#0F1A2C] flex items-center gap-2">
                  <ImageIcon size={17} className="text-blue-600" /> Photographs & Evidence
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Citizen submission photos and field crew completion proof
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {item.images.length} {item.images.length === 1 ? "file" : "files"}
              </span>
            </div>

            {item.images.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {item.images.map(image => (
                  <a
                    key={image.id}
                    href={image.secureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 transition shadow-sm hover:shadow-md"
                  >
                    <img
                      src={image.secureUrl}
                      alt={`${readable(image.kind)} evidence`}
                      className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="px-3.5 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        {readable(image.kind)} Evidence
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold group-hover:underline">
                        View full &rarr;
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-400 text-center">
                No photographs attached to this report.
              </p>
            )}
          </div>

          {/* Status Timeline */}
          <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
            <h2 className="font-heading text-base font-bold text-[#0F1A2C] mb-4">
              Status Timeline & Audit History
            </h2>

            {item.history.length ? (
              <ol className="space-y-0">
                {item.history.map((entry, index) => (
                  <li key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
                    <div className="relative flex w-5 shrink-0 justify-center">
                      {index < item.history.length - 1 && (
                        <span className="absolute top-3.5 h-full w-0.5 bg-slate-200" />
                      )}
                      <span
                        className={`relative mt-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          index === 0
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {index === 0 && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[#0F1A2C]">
                          {readable(entry.toStatus)}
                        </p>
                        <span className="font-mono text-[11px] text-slate-400">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>

                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                        <UserRound size={12} /> {entry.actor.name} &bull; {readable(entry.actor.role)}
                      </p>

                      {entry.remarks && (
                        <p className="mt-2 text-xs leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {entry.remarks}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-slate-400">No status updates recorded yet.</p>
            )}
          </div>
        </div>

        {/* Right Sidebar Column */}
        <aside className="space-y-6">
          {/* Action Box */}
          <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
            <h2 className="font-heading text-base font-bold text-[#0F1A2C]">
              Operational Actions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Available workflow transitions
            </p>

            <div className="mt-4">
              {role === "admin" && item.status === "RESOLVED" && (
                <ResolutionReviewActions
                  id={item.id}
                  approved={Boolean(item.resolutionApprovedAt)}
                />
              )}
              <ComplaintActions
                id={item.id}
                role={role}
                status={item.status}
                priority={item.priority}
                departmentId={item.departmentId}
                resolutionApprovedAt={Boolean(item.resolutionApprovedAt)}
                feedback={item.feedback}
              />
            </div>
          </div>

          {/* Assigned Field Crew */}
          <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
            <h2 className="font-heading text-base font-bold text-[#0F1A2C]">
              Assigned Field Crew
            </h2>

            {item.assignments.length ? (
              <div className="mt-4 space-y-2.5">
                {item.assignments.map(assignment => (
                  <div
                    key={assignment.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs">
                      <UserRound size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#0F1A2C] truncate">
                        {assignment.worker.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {readable(assignment.status)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-400 text-center">
                No field worker assigned yet.
              </p>
            )}

            <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Citizen Support</span>
              <span className="font-bold text-[#0F1A2C]">
                {item._count.supports} {item._count.supports === 1 ? "vote" : "votes"}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
