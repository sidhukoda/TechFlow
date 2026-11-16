"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const data = [
  { month: "Jan", thisYear: 4, prevYear: 2 },
  { month: "Feb", thisYear: 10, prevYear: 6 },
  { month: "Mar", thisYear: 8, prevYear: 5 },
  { month: "Apr", thisYear: 15, prevYear: 9 },
  { month: "May", thisYear: 12, prevYear: 11 },
  { month: "Jun", thisYear: 19, prevYear: 14 },
  { month: "Jul", thisYear: 16, prevYear: 13 },
  { month: "Aug", thisYear: 22, prevYear: 15 }
];

export function DashboardActivityChart({ totalCount = 14 }: { totalCount?: number }) {
  const [activeTab, setActiveTab] = useState<"reports" | "resolved" | "speed">("reports");

  return (
    <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-6 text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 transition ${
              activeTab === "reports" ? "text-[#0F1A2C]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#1A6BFF]" />
            <span>Reports</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("resolved")}
            className={`transition ${
              activeTab === "resolved" ? "text-[#0F1A2C]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Resolutions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("speed")}
            className={`transition ${
              activeTab === "speed" ? "text-[#0F1A2C]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Response Time
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-[#1A6BFF]" /> This year
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-400">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" /> Previous year
            </span>
          </div>
          <button type="button" className="font-semibold text-blue-600 hover:underline">
            See more
          </button>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs text-slate-400">
          <span className="font-bold text-[#0F1A2C]">{totalCount} complaints</span> reported this year
        </p>
      </div>

      {/* Dual Curved Smooth Area Chart (Matching iMed Portal screenshot) */}
      <div className="mt-4 h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1A6BFF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1A6BFF" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl bg-[#0A1120] px-3.5 py-2.5 text-white shadow-xl">
                      <p className="text-[10px] text-slate-400">{label}, 2026</p>
                      <p className="text-xs font-bold text-white mt-0.5">
                        {payload[0].value} complaints
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="natural"
              dataKey="thisYear"
              stroke="#1A6BFF"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#blueGradient)"
            />
            <Area
              type="natural"
              dataKey="prevYear"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#greenGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
