import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { AppError, requireUser } from "@/lib/permissions";
import { complaintEditSchema } from "@/lib/validations";
import { getComplaint } from "@/services/complaint.service";
type Params = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Params) {
  try { return ok(await getComplaint(await requireUser(), (await params).id)); }
  catch (error) { return errorResponse(error); }
}
export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await requireUser([Role.CITIZEN]); const id = (await params).id;
    const item = await getComplaint(actor, id);
    if (item.status !== "SUBMITTED") throw new AppError(409, "Only submitted complaints can be edited");
    const data = await body(request, complaintEditSchema);
    return ok(await prisma.complaint.update({ where: { id }, data }));
  } catch (error) { return errorResponse(error); }
}
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const actor = await requireUser([Role.CITIZEN]); const id = (await params).id;
    const item = await getComplaint(actor, id);
    if (item.status !== "SUBMITTED") throw new AppError(409, "Only submitted complaints can be withdrawn");
    await prisma.$transaction(async tx => { await tx.complaint.update({ where: { id }, data: { deletedAt: new Date() } }); await tx.auditLog.create({ data: { actorId: actor.id, action: "WITHDRAW", entityType: "complaint", entityId: id } }); });
    return ok({ withdrawn: true });
  } catch (error) { return errorResponse(error); }
}
