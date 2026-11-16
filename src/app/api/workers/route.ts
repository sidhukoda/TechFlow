import { Role, Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { AppError, requireUser } from "@/lib/permissions";
import { staffSchema } from "@/lib/validations";
export async function GET() {
  try {
    const actor = await requireUser([Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN]);
    const where: Prisma.UserWhereInput = { role: Role.FIELD_WORKER, ...(actor.role === Role.DEPARTMENT_ADMIN ? { departmentId: actor.departmentId ?? "" } : {}) };
    const items = await prisma.user.findMany({ where, select: { id: true, name: true, email: true, phone: true, isActive: true, departmentId: true, department: { select: { name: true } }, _count: { select: { assignments: { where: { status: "ACTIVE" } } } } }, orderBy: { name: "asc" } });
    return ok(items.sort((a,b) => a._count.assignments - b._count.assignments));
  } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try {
    const actor = await requireUser([Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN]); const input = await body(request, staffSchema);
    if (actor.role === Role.DEPARTMENT_ADMIN && actor.departmentId !== input.departmentId) throw new AppError(403, "Access denied");
    const passwordHash = await hash(input.password, 12);
    return ok(await prisma.$transaction(async tx => { const worker = await tx.user.create({ data: { name: input.name, email: input.email, phone: input.phone, departmentId: input.departmentId, passwordHash, role: Role.FIELD_WORKER }, select: { id: true, name: true, email: true, departmentId: true } }); await tx.auditLog.create({ data: { actorId: actor.id, action: "CREATE", entityType: "worker", entityId: worker.id } }); return worker; }), 201);
  } catch (error) { return errorResponse(error); }
}
