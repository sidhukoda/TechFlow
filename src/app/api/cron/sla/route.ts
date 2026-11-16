import { ComplaintStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorResponse, ok } from "@/lib/http";
import { AppError } from "@/lib/permissions";
export async function GET(request: Request) {
  try {
    if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) throw new AppError(401, "Unauthorized");
    let created = 0;
    let checked = 0;
    let cursor: string | undefined;
    while (true) {
      const overdue = await prisma.complaint.findMany({ where: { deletedAt: null, id: cursor ? { gt: cursor } : undefined, dueAt: { lt: new Date() }, status: { notIn: [ComplaintStatus.CLOSED, ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED] } }, select: { id: true, ticketNumber: true, departmentId: true }, orderBy: { id: "asc" }, take: 500 });
      if (!overdue.length) break;
      checked += overdue.length;
      for (const item of overdue) {
        const admins = await prisma.user.findMany({ where: { role: "DEPARTMENT_ADMIN", departmentId: item.departmentId, isActive: true }, select: { id: true } });
        for (const admin of admins) {
          const eventKey = `sla:${item.id}:${admin.id}`;
          const result = await prisma.notification.createMany({ data: [{ userId: admin.id, title: "SLA overdue", body: `${item.ticketNumber} has passed its deadline.`, href: `/admin/complaints/${item.id}`, eventKey }], skipDuplicates: true });
          created += result.count;
        }
      }
      cursor = overdue[overdue.length - 1].id;
      if (overdue.length < 500) break;
    }
    return ok({ checked, created });
  } catch (error) { return errorResponse(error); }
}
