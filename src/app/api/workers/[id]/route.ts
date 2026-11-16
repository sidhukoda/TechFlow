import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { AppError, requireUser } from "@/lib/permissions";
import { z } from "zod";
type Params = { params: Promise<{ id: string }> };
const schema = z.object({ name: z.string().min(2).max(100).optional(), phone: z.string().max(30).nullable().optional(), isActive: z.boolean().optional(), departmentId: z.string().uuid().optional() });
export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await requireUser([Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN]); const id = (await params).id;
    const worker = await prisma.user.findFirst({ where: { id, role: Role.FIELD_WORKER } });
    if (!worker) throw new AppError(404, "Worker not found");
    if (actor.role === Role.DEPARTMENT_ADMIN && worker.departmentId !== actor.departmentId) throw new AppError(403, "Access denied");
    const data = await body(request, schema);
    if (actor.role === Role.DEPARTMENT_ADMIN && data.departmentId && data.departmentId !== actor.departmentId) throw new AppError(403, "Access denied");
    return ok(await prisma.$transaction(async tx => { const updated = await tx.user.update({ where: { id }, data, select: { id: true, name: true, email: true, phone: true, departmentId: true, isActive: true } }); await tx.auditLog.create({ data: { actorId: actor.id, action: "UPDATE", entityType: "worker", entityId: id } }); return updated; }));
  } catch (error) { return errorResponse(error); }
}
