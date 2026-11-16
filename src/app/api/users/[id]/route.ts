import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { AppError, requireUser } from "@/lib/permissions";
import { z } from "zod";
type Params = { params: Promise<{ id: string }> };
const schema = z.object({ name: z.string().min(2).max(100).optional(), isActive: z.boolean().optional(), departmentId: z.string().uuid().nullable().optional() });
export async function PATCH(request: Request, { params }: Params) {
  try { const actor = await requireUser([Role.SUPER_ADMIN]); const id = (await params).id; if (id === actor.id) throw new AppError(400, "Use your profile to edit your own account"); const data = await body(request, schema); return ok(await prisma.$transaction(async tx => { const item = await tx.user.update({ where: { id }, data, select: { id: true, name: true, email: true, isActive: true, departmentId: true } }); await tx.auditLog.create({ data: { actorId: actor.id, action: "UPDATE", entityType: "user", entityId: id } }); return item; })); }
  catch (error) { return errorResponse(error); }
}
