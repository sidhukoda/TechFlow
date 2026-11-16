"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Building2, Tag, Calendar, CheckCircle2, Clock } from "lucide-react";
import { api } from "@/lib/client-api";
import { formatDate, readable } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type TrackResult = {
  id: string;
  ticketNumber: string;
  title: string;
  description?: string;
  address?: string;
  status: string;
  priority: string;
  createdAt: string;
  category: { name: string };
  department: { name: string };
  images?: { id: string; secureUrl: string; kind: string }[];
  history: { id?: string; toStatus: string; remarks?: string | null; createdAt: string }[];
};

export function TrackForm() {
  const [ticket, setTicket] = useState("");
  const [item, setItem] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticket.trim()) return;
    setBusy(true);
    setError("");
    setItem(null);
    try {
      setItem(await api<TrackResult>(`/api/track/${encodeURIComponent(ticket.trim())}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ticket not found. Please verify the ticket identifier.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={ticket}
            onChange={e => setTicket(e.target.value)}
            placeholder="Enter ticket number (e.g. TF-2026-000001)"
            aria-label="Ticket number"
            style={{ paddingLeft: "2.75rem" }}
            className="pl-11 rounded-xl h-11 text-xs"
            required
          />
        </div>
        <button
          disabled={busy || !ticket.trim()}
          type="submit"
          className="rounded-xl bg-[#0A1120] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#162238] disabled:opacity-50"
        >
          {busy ? "Searching..." : "Track Report"}
        </button>
      </form>

      {error && (
        <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {item && (
        <div className="rounded-2xl border border-[#EDF2F7] bg-[#F8FAFD] p-6 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div>
              <span className="font-mono text-xs font-bold text-blue-600 tracking-wide">
                {item.ticketNumber}
              </span>
              <h2 className="mt-1 font-heading text-xl font-bold text-[#0F1A2C]">{item.title}</h2>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <Tag size={13} className="text-blue-600" /> {item.category.name}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Building2 size={13} className="text-blue-600" /> {item.department.name}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar size={13} className="text-blue-600" /> {formatDate(item.createdAt)}
                </span>
                {item.address && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin size={13} className="text-blue-600" /> {item.address}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge value={item.status} />
              <Badge value={item.priority} />
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="text-xs text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              {item.description}
            </div>
          )}

          {/* Photographs Preview */}
          {item.images && item.images.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#0F1A2C] mb-3">
                Evidence Photographs
              </h3>
              <div className="flex flex-wrap gap-3">
                {item.images.map(img => (
                  <a
                    key={img.id}
                    href={img.secureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="relative block h-24 w-36 overflow-hidden rounded-xl border border-slate-200 shadow-sm transition hover:opacity-90"
                  >
                    <Image
                      src={img.secureUrl}
                      alt="Complaint photo"
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Visual Vertical Timeline */}
          <div className="border-t border-slate-200/80 pt-5">
            <h3 className="text-xs font-bold text-[#0F1A2C] mb-4">
              Status Progression
            </h3>

            {item.history && item.history.length > 0 ? (
              <ol className="space-y-0">
                {item.history.map((hist, idx) => (
                  <li key={`${hist.toStatus}-${hist.createdAt}-${idx}`} className="relative flex gap-3.5 pb-6 last:pb-0">
                    <div className="relative flex w-4 shrink-0 justify-center">
                      {idx < item.history.length - 1 && (
                        <div className="absolute top-3.5 h-full w-0.5 bg-slate-200" />
                      )}
                      <div
                        className={`relative mt-1 h-3.5 w-3.5 rounded-full border-2 ${
                          idx === 0
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-slate-300"
                        }`}
                      />
                    </div>
                    <div className="flex flex-1 flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-[#0F1A2C]">{readable(hist.toStatus)}</p>
                        {hist.remarks && (
                          <p className="text-xs text-slate-500 mt-1">{hist.remarks}</p>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatDate(hist.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-slate-400">No status changes have been recorded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
