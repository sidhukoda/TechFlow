import { ComplaintStatus } from "@prisma/client";
import { body, errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
import { statusSchema } from "@/lib/validations";
import { changeStatus } from "@/services/complaint.service";
type Params = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Params) {
  try { const actor = await requireUser(); const input = await body(request, statusSchema); return ok(await changeStatus(actor, (await params).id, input.status as ComplaintStatus, input.remarks)); }
  catch (error) { return errorResponse(error); }
}
