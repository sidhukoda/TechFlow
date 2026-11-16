import { Role } from "@prisma/client";
import { body, errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
import { prioritySchema } from "@/lib/validations";
import { setPriority } from "@/services/complaint.service";
type Params = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Params) {
  try { const actor = await requireUser([Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN]); const { priority } = await body(request, prioritySchema); return ok(await setPriority(actor, (await params).id, priority)); }
  catch (error) { return errorResponse(error); }
}
