"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type Monthly = { month: string; total: number; resolved: number };
type Named = {
  name: string;
  count?: number;
  total?: number;
  resolved?: number;
  active?: number;
};

const PALETTE = ["#1A6BFF", "#10B981", "#FF9500", "#8B5CF6", "#06B6D4", "#F43F5E", "#64748B"];

// Custom dark tooltip matching iMed Portal style
function CustomChartTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-[#0B1527] p-3 text-xs text-white shadow-2xl backdrop-blur-md">
        {label && <p className="font-bold text-slate-200 mb-1">{label}</p>}
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 py-0.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-slate-400 capitalize">{entry.name}:</span>
            <span className="font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function AnalyticsCharts({
  monthly,
  categories,
  departments,
  workers,
  statuses
}: {
  monthly: Monthly[];
  categories: Named[];
  departments: Named[];
  workers: Named[];
  statuses: Named[];
}) {
  return (
    <div className="space-y-6">
      {/* Row 1: Monthly Trends & Status Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Bar Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-[#0F1A2C]">
                Monthly Incident & Resolution Trends
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total reported complaints vs. successfully resolved tickets
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-[#1A6BFF]" /> Reported
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" /> Resolved
              </span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar
                  dataKey="total"
                  fill="#1A6BFF"
                  name="Reported"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="resolved"
                  fill="#10B981"
                  name="Resolved"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut/Pie */}
        <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
          <div>
            <h3 className="font-heading text-base font-bold text-[#0F1A2C]">
              Status Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live breakdown of reports by lifecycle state
            </p>
          </div>

          <div className="h-72">
            {statuses.some(s => s.count) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statuses.filter(s => (s.count ?? 0) > 0)}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {statuses.map((x, i) => (
                      <Cell key={x.name} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No complaint records yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Category Distribution & Department Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Share */}
        <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
          <div>
            <h3 className="font-heading text-base font-bold text-[#0F1A2C]">
              Category Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Distribution across civic working types
            </p>
          </div>

          <div className="h-72">
            {categories.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {categories.map((x, i) => (
                      <Cell key={x.name} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No categorized reports yet
              </div>
            )}
          </div>
        </div>

        {/* Department Performance */}
        <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-[#0F1A2C]">
                Department Workload & Resolution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total load vs. resolved tickets by municipal agency
              </p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departments}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="total" fill="#1A6BFF" name="Total" radius={[0, 4, 4, 0]} maxBarSize={18} />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Worker Active Workload */}
      <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card">
        <div>
          <h3 className="font-heading text-base font-bold text-[#0F1A2C]">
            Field Worker Workload
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active on-site tasks currently assigned to each field engineer
          </p>
        </div>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={workers}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 10, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Bar dataKey="active" fill="#1A6BFF" name="Active Tasks" radius={[0, 6, 6, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
