import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
import { departmentSchema } from "@/lib/validations";
import { z } from "zod";
type Params = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Params) {
  try { const actor = await requireUser([Role.SUPER_ADMIN]); const id = (await params).id; const data = await body(request, departmentSchema.partial().extend({ isActive: z.boolean().optional() })); return ok(await prisma.$transaction(async tx => { const item = await tx.department.update({ where: { id }, data }); await tx.auditLog.create({ data: { actorId: actor.id, action: "UPDATE", entityType: "department", entityId: id } }); return item; })); }
  catch (error) { return errorResponse(error); }
}
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const actor = await requireUser([Role.SUPER_ADMIN]);
    const id = (await params).id;
    const count = await prisma.complaint.count({ where: { departmentId: id } });
    if (count > 0) {
      const item = await prisma.department.update({ where: { id }, data: { isActive: false } });
      await prisma.auditLog.create({ data: { actorId: actor.id, action: "UPDATE", entityType: "department", entityId: id, details: { deactivatedDueToExistingComplaints: count } } });
      return ok({ message: "Department has complaints; it has been deactivated instead of deleted.", item });
    }
    await prisma.$transaction(async tx => {
      await tx.category.deleteMany({ where: { departmentId: id } });
      await tx.slaPolicy.deleteMany({ where: { departmentId: id } });
      await tx.department.delete({ where: { id } });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "DELETE", entityType: "department", entityId: id } });
    });
    return ok({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
