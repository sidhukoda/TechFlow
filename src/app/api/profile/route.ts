import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
import { profileSchema } from "@/lib/validations";
export async function GET() {
  try { const user = await requireUser(); return ok({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }); }
  catch (error) { return errorResponse(error); }
}
export async function PATCH(request: Request) {
  try { const actor = await requireUser(); const data = await body(request, profileSchema); return ok(await prisma.user.update({ where: { id: actor.id }, data, select: { id: true, name: true, email: true, phone: true, role: true } })); }
  catch (error) { return errorResponse(error); }
}
