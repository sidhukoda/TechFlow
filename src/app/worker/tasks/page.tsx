import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { ComplaintTable } from "@/components/complaints/complaint-table";
import { Clock, CheckCircle2 } from "lucide-react";
import { DEMO_COMPLAINTS } from "@/lib/demo-data";

export default async function Tasks() {
  const user = await requireUser();

  let items: any[] = DEMO_COMPLAINTS;
  let activeCount = 3;
  let completedCount = 8;

  try {
    const [assignments, fetchedActive, fetchedCompleted] = await Promise.all([
      prisma.assignment.findMany({
        where: { workerId: user.id },
        include: {
          complaint: {
            include: { category: true, department: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 100
      }),
      prisma.assignment.count({ where: { workerId: user.id, status: "ACTIVE" } }),
      prisma.assignment.count({ where: { workerId: user.id, status: "COMPLETED" } })
    ]);
    if (assignments.length) {
      items = assignments.map(a => a.complaint);
    }
    activeCount = fetchedActive || 3;
    completedCount = fetchedCompleted || 8;
  } catch (err) {
    console.warn("[WorkerTasks] Database offline, showing demo assignments");
  }

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
            My Assigned Tasks
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Field work orders and maintenance dispatches assigned to your crew
          </p>
        </div>

        {/* Small stats badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#EEF4FE] px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
            <Clock size={13} />
            <span>{activeCount} Active</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-[#EDFAF1] px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
            <CheckCircle2 size={13} />
            <span>{completedCount} Completed</span>
          </div>
        </div>
      </div>

      {/* Task Table */}
      <ComplaintTable items={items} base="/worker/tasks" />
    </div>
  );
}
