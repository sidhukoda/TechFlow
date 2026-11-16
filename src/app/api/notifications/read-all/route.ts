import { prisma } from "@/lib/prisma";
import { errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
export async function PATCH() {
  try { const actor = await requireUser(); const result = await prisma.notification.updateMany({ where: { userId: actor.id, readAt: null }, data: { readAt: new Date() } }); return ok({ count: result.count }); }
  catch (error) { return errorResponse(error); }
}
