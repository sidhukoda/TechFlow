import { ComplaintStatus, Prisma, Role, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DEMO_OVERVIEW,
  DEMO_MONTHLY,
  DEMO_CATEGORY_STATS,
  DEMO_DEPT_STATS,
  DEMO_WORKER_WORKLOAD
} from "@/lib/demo-data";

function scope(user: User): Prisma.ComplaintWhereInput {
  return {
    deletedAt: null,
    ...(user.role === Role.DEPARTMENT_ADMIN ? { departmentId: user.departmentId ?? "" } : {})
  };
}

export async function overview(user: User) {
  try {
    const where = scope(user);
    const [total, statuses, overdue, resolved] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.groupBy({ by: ["status"], where, _count: { _all: true } }),
      prisma.complaint.count({
        where: {
          ...where,
          dueAt: { lt: new Date() },
          status: { notIn: [ComplaintStatus.CLOSED, ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED] }
        }
      }),
      prisma.complaint.findMany({
        where: { ...where, resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true }
      })
    ]);
    const byStatus = Object.fromEntries(
      Object.values(ComplaintStatus).map(s => [s, statuses.find(x => x.status === s)?._count._all ?? 0])
    );
    const averageResolutionHours = resolved.length
      ? Math.round(
          (resolved.reduce((sum, c) => sum + (c.resolvedAt!.getTime() - c.createdAt.getTime()) / 3600000, 0) /
            resolved.length) *
            10
        ) / 10
      : null;
    return {
      total,
      byStatus,
      pending: total - (byStatus.RESOLVED + byStatus.CLOSED + byStatus.REJECTED),
      overdue,
      averageResolutionHours
    };
  } catch (err) {
    console.warn("[Analytics] Database offline, returning demo overview metrics");
    return DEMO_OVERVIEW;
  }
}

export async function categories(user: User) {
  try {
    const rows = await prisma.complaint.groupBy({ by: ["categoryId"], where: scope(user), _count: { _all: true } });
    const names = await prisma.category.findMany({
      where: { id: { in: rows.map(x => x.categoryId) } },
      select: { id: true, name: true }
    });
    return rows.map(r => ({
      categoryId: r.categoryId,
      name: names.find(n => n.id === r.categoryId)?.name ?? "Unknown",
      count: r._count._all
    }));
  } catch {
    return DEMO_CATEGORY_STATS;
  }
}

export async function departments(user: User) {
  try {
    const rows = await prisma.complaint.groupBy({ by: ["departmentId", "status"], where: scope(user), _count: { _all: true } });
    const names = await prisma.department.findMany({
      where: { id: { in: rows.map(x => x.departmentId) } },
      select: { id: true, name: true }
    });
    return names.map(d => {
      const r = rows.filter(x => x.departmentId === d.id);
      return {
        departmentId: d.id,
        name: d.name,
        total: r.reduce((a, b) => a + b._count._all, 0),
        resolved: r
          .filter(x => x.status === ComplaintStatus.RESOLVED || x.status === ComplaintStatus.CLOSED)
          .reduce((a, b) => a + b._count._all, 0)
      };
    });
  } catch {
    return DEMO_DEPT_STATS;
  }
}

export async function monthly(user: User) {
  try {
    const where = scope(user);
    const since = new Date();
    since.setMonth(since.getMonth() - 11);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);
    const items = await prisma.complaint.findMany({
      where: { ...where, createdAt: { gte: since } },
      select: { createdAt: true, status: true }
    });
    const buckets = new Map<string, { month: string; total: number; resolved: number }>();
    for (let i = 0; i < 12; i++) {
      const d = new Date(since);
      d.setMonth(d.getMonth() + i);
      const month = d.toISOString().slice(0, 7);
      buckets.set(month, { month, total: 0, resolved: 0 });
    }
    for (const item of items) {
      const row = buckets.get(item.createdAt.toISOString().slice(0, 7));
      if (row) {
        row.total++;
        if (item.status === ComplaintStatus.RESOLVED || item.status === ComplaintStatus.CLOSED) row.resolved++;
      }
    }
    return [...buckets.values()];
  } catch {
    return DEMO_MONTHLY;
  }
}

export async function workerWorkload(user: User) {
  try {
    const workers = await prisma.user.findMany({
      where: {
        role: Role.FIELD_WORKER,
        ...(user.role === Role.DEPARTMENT_ADMIN ? { departmentId: user.departmentId ?? "" } : {})
      },
      select: {
        id: true,
        name: true,
        _count: { select: { assignments: { where: { status: "ACTIVE" } } } }
      },
      orderBy: { name: "asc" }
    });
    return workers.map(w => ({ name: w.name, active: w._count.assignments }));
  } catch {
    return DEMO_WORKER_WORKLOAD;
  }
}
