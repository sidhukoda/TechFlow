import { Role } from "@prisma/client";
import { body, errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
import { assignmentSchema } from "@/lib/validations";
import { assignWorker } from "@/services/complaint.service";
type Params = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: Params) {
  try { const actor = await requireUser([Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN]); const input = await body(request, assignmentSchema); return ok(await assignWorker(actor, (await params).id, input.workerId, input.remarks), 201); }
  catch (error) { return errorResponse(error); }
}
