import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorResponse, ok } from "@/lib/http";
import { AppError, requireUser } from "@/lib/permissions";
type Params = { params: Promise<{ id: string }> };
export async function POST(_request: Request, { params }: Params) {
  try {
    const actor = await requireUser([Role.CITIZEN]); const id = (await params).id;
    const item = await prisma.complaint.findFirst({ where: { id, deletedAt: null }, select: { citizenId: true } });
    if (!item) throw new AppError(404, "Complaint not found");
    if (item.citizenId === actor.id) throw new AppError(400, "You cannot support your own complaint");
    await prisma.complaintSupport.create({ data: { complaintId: id, citizenId: actor.id } });
    return ok({ supported: true }, 201);
  } catch (error) { return errorResponse(error); }
}
