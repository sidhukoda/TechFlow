import Link from "next/link";
import { ArrowUpRight, Plus, FolderOpen, Calendar, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { EmptyStateIllustration } from "@/components/illustrations/empty-state-illustration";

export type ComplaintRow = {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  createdAt: Date | string;
  dueAt: Date | string | null;
  category: { name: string };
  department: { name: string };
};

export function ComplaintTable({ items, base }: { items: ComplaintRow[]; base: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#EDF2F7] bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#EDF2F7] bg-slate-50/50">
              {["Ticket & Issue", "Category", "Department", "Priority", "Reported", "Status", ""].map(h => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDF2F7]">
            {items.map(item => (
              <tr
                key={item.id}
                className="group transition-colors hover:bg-[#F8FAFD]"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`${base}/${item.id}`}
                    className="font-bold text-[#0F1A2C] group-hover:text-blue-600 transition truncate max-w-xs block"
                  >
                    {item.title}
                  </Link>
                  <p className="font-mono text-xs font-semibold text-blue-600 mt-0.5">
                    {item.ticketNumber}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/70 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    <Tag size={11} className="text-slate-400" />
                    {item.category.name}
                  </span>
                </td>

                <td className="px-5 py-4 text-xs font-medium text-slate-600">
                  {item.department.name}
                </td>

                <td className="px-5 py-4">
                  <Badge value={item.priority} />
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400 font-medium">
                  {formatDate(item.createdAt)}
                </td>

                <td className="px-5 py-4">
                  <Badge value={item.status} />
                </td>

                <td className="px-5 py-4 text-right">
                  <Link
                    href={`${base}/${item.id}`}
                    aria-label={`Open ${item.ticketNumber}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-[#1A6BFF] hover:border-[#1A6BFF] hover:text-white"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!items.length && (
        <div className="px-6 py-14 text-center">
          <EmptyStateIllustration className="mx-auto h-24 w-28 opacity-90" />
          <h3 className="mt-4 text-base font-bold text-[#0F1A2C]">No reports recorded</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Public infrastructure reports will appear here as citizens submit them or as tasks are assigned.
          </p>
          {base.includes("/citizen") && (
            <div className="mt-5">
              <Button asChild size="sm" className="rounded-xl bg-[#1A6BFF] hover:bg-[#1559D6] text-white">
                <Link href="/citizen/new-complaint">
                  <Plus size={15} /> Submit Your First Report
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
