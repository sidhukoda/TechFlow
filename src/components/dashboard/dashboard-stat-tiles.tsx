"use client";

import { ClipboardList, Clock3, CheckCircle2, ShieldCheck, Activity } from "lucide-react";

export function DashboardStatTiles({
  total = 0,
  active = 0,
  resolved = 0
}: {
  total: number;
  active: number;
  resolved: number;
}) {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Vibrant Electric Blue Hero Card (Matching "Weight 72 kg" card in image) */}
      <div className="flex items-center justify-between rounded-2xl bg-[#1A6BFF] p-5 text-white shadow-card transition-transform hover:-translate-y-0.5">
        <div>
          <p className="text-xs font-medium text-blue-100">Total Reports</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">{total}</p>
          <p className="text-[11px] text-blue-100/80 mt-0.5">Reported by you</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
          <ClipboardList size={22} />
        </div>
      </div>

      {/* 2. Soft Mint Green Card (Matching "Age 28 y.o." card in image) */}
      <div className="flex items-center justify-between rounded-2xl border border-emerald-100/60 bg-[#EAF7EE] p-5 text-slate-800 shadow-card transition-transform hover:-translate-y-0.5">
        <div>
          <p className="text-xs font-medium text-[#16A34A]">Resolved Fixes</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#0F1A2C]">{resolved}</p>
          <p className="text-[11px] text-[#16A34A]/80 mt-0.5">Awaiting verification</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#16A34A] shadow-sm">
          <CheckCircle2 size={22} />
        </div>
      </div>

      {/* 3. Soft Ice Blue Card (Matching "Height 181 cm" card in image) */}
      <div className="flex items-center justify-between rounded-2xl border border-blue-100/60 bg-[#EEF4FE] p-5 text-slate-800 shadow-card transition-transform hover:-translate-y-0.5">
        <div>
          <p className="text-xs font-medium text-blue-600">Active Work</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#0F1A2C]">{active}</p>
          <p className="text-[11px] text-blue-500/80 mt-0.5">In field progress</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
          <Clock3 size={22} />
        </div>
      </div>

      {/* 4. Soft Periwinkle Card (Matching "Pulse 96 BPM" card in image) */}
      <div className="flex items-center justify-between rounded-2xl border border-purple-100/60 bg-[#F0EEFF] p-5 text-slate-800 shadow-card transition-transform hover:-translate-y-0.5">
        <div>
          <p className="text-xs font-medium text-[#6366F1]">Success SLA</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#0F1A2C]">94.8%</p>
          <p className="text-[11px] text-[#6366F1]/80 mt-0.5">On-time resolutions</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#6366F1] shadow-sm">
          <Activity size={22} />
        </div>
      </div>
    </div>
  );
}
