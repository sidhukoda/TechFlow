import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorResponse, ok } from "@/lib/http";
import { AppError, requireUser } from "@/lib/permissions";
type Params = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Params) {
  try { const actor = await requireUser([Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN, Role.FIELD_WORKER]); const id = (await params).id; const worker = await prisma.user.findFirst({ where: { id, role: Role.FIELD_WORKER } }); if (!worker || (actor.role === Role.FIELD_WORKER && actor.id !== id) || (actor.role === Role.DEPARTMENT_ADMIN && actor.departmentId !== worker.departmentId)) throw new AppError(403, "Access denied"); return ok(await prisma.assignment.findMany({ where: { workerId: id }, include: { complaint: { include: { category: true } } }, orderBy: { createdAt: "desc" } })); }
  catch (error) { return errorResponse(error); }
}
