import { prisma } from "@/lib/prisma";
import { errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
type Params = { params: Promise<{ id: string }> };
export async function PATCH(_request: Request, { params }: Params) {
  try { const actor = await requireUser(); await prisma.notification.updateMany({ where: { id: (await params).id, userId: actor.id }, data: { readAt: new Date() } }); return ok({ read: true }); }
  catch (error) { return errorResponse(error); }
}
