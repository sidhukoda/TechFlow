"use client";

import { useEffect, useState } from "react";
import { Clock, ShieldCheck, Save, Sparkles, AlertCircle } from "lucide-react";
import { api } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Policy = {
  id: string;
  priority: string;
  hours: number;
  department: { name: string } | null;
};

const priorityStyles: Record<string, { bg: string; text: string; border: string; desc: string }> = {
  LOW: {
    bg: "bg-[#EDFAF1]",
    text: "text-emerald-700",
    border: "border-emerald-200/60",
    desc: "Routine maintenance and non-urgent cosmetic repairs"
  },
  MEDIUM: {
    bg: "bg-[#EEF4FE]",
    text: "text-blue-700",
    border: "border-blue-200/60",
    desc: "Standard public inconvenience or service disruption"
  },
  HIGH: {
    bg: "bg-[#FFF7ED]",
    text: "text-amber-700",
    border: "border-amber-200/60",
    desc: "Significant disruption, water mains, active road blockage"
  },
  CRITICAL: {
    bg: "bg-[#FEF2F2]",
    text: "text-rose-700",
    border: "border-rose-200/60",
    desc: "Immediate public safety hazard or electrical emergency"
  }
};

export function SlaManager() {
  const [items, setItems] = useState<Policy[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setItems(await api("/api/sla-policies"));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    const data = new FormData(e.currentTarget);
    try {
      await api("/api/sla-policies", {
        method: "POST",
        body: JSON.stringify({
          priority: data.get("priority"),
          hours: Number(data.get("hours"))
        })
      });
      setSuccess("SLA deadline updated successfully.");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 4 Priority Policy Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(pKey => {
          const matched = items.find(i => i.priority === pKey);
          const hours = matched ? matched.hours : pKey === "LOW" ? 72 : pKey === "MEDIUM" ? 48 : pKey === "HIGH" ? 24 : 12;
          const style = priorityStyles[pKey] || priorityStyles.LOW;

          return (
            <div
              key={pKey}
              className={`rounded-2xl border ${style.border} ${style.bg} p-5 shadow-card transition duration-200 hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${style.text} bg-white/70 shadow-sm`}>
                  {pKey} Priority
                </span>
                <Clock size={16} className={style.text} />
              </div>

              <div className="mt-4">
                <p className={`font-heading text-3xl font-bold ${style.text}`}>
                  {hours} <span className="text-sm font-semibold">hrs</span>
                </p>
                <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">
                  {style.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 text-[11px] font-semibold text-slate-500">
                {matched?.department?.name || "Global Standard Policy"}
              </div>
            </div>
          );
        })}
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-100 bg-[#EDFAF1] p-3 text-xs font-semibold text-emerald-800">
          {success}
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Adjust Policy Form */}
      <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
        <div>
          <h3 className="font-heading text-base font-bold text-[#0F1A2C]">
            Configure Resolution Deadlines
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Set maximum operational duration in hours before a ticket triggers escalation warnings
          </p>
        </div>

        <form onSubmit={submit} className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="priority" className="block text-xs font-bold text-slate-700 mb-1">
              Priority Tier
            </label>
            <div className="relative">
              <select
                id="priority"
                name="priority"
                className="w-full appearance-none rounded-xl border border-slate-200/90 bg-white py-2 pl-3.5 pr-8 text-xs font-semibold text-[#0F1A2C] shadow-sm hover:bg-slate-50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-2.5 text-[10px] text-slate-400">▼</span>
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="hours" className="block text-xs font-bold text-slate-700 mb-1">
              Resolution Hours
            </label>
            <Input
              id="hours"
              name="hours"
              type="number"
              min={1}
              max={8760}
              placeholder="e.g. 24"
              required
              className="rounded-xl text-xs"
            />
          </div>

          <button
            disabled={busy}
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0A1120] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#162238] disabled:opacity-50"
          >
            <Save size={14} />
            <span>{busy ? "Saving..." : "Save Deadline"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
