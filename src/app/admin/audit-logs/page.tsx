import { prisma } from "@/lib/prisma";
import { requireSuperAdminPage } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { ShieldAlert, User, Clock, Terminal } from "lucide-react";

export default async function AuditLogsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSuperAdminPage();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const pageSize = 20;

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { actor: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize
    }),
    prisma.auditLog.count()
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
          System Audit Logs
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Immutable audit trail recording administrative decisions, user modifications, and complaint status changes
        </p>
      </div>

      {/* Logs Table Card */}
      <div className="overflow-hidden rounded-2xl border border-[#EDF2F7] bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#EDF2F7] bg-slate-50/50">
                {["Timestamp", "Actor", "Action", "Target Entity", "Entity ID"].map(h => (
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
              {items.map(log => {
                const actorName = log.actor?.name || "System Automated";
                const initials = actorName
                  .split(" ")
                  .map(p => p[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <tr key={log.id} className="transition-colors hover:bg-[#F8FAFD]">
                    <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-slate-500">
                      {formatDate(log.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-[10px]">
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0F1A2C] leading-none">
                            {actorName}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                            {log.actor?.role || "SYSTEM"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg bg-blue-50/80 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                      {log.entityType}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-slate-400">
                      {log.entityId.slice(0, 12)}...
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!items.length && (
          <div className="py-12 text-center text-xs text-slate-400">
            No audit records captured yet.
          </div>
        )}
      </div>

      {/* Pagination */}
      <PaginationBar
        page={page}
        total={total}
        pageSize={pageSize}
        base="/admin/audit-logs"
      />
    </div>
  );
}
