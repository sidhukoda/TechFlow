import { ComplaintStatus, Role } from "@prisma/client";
import { body, errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
import { statusSchema } from "@/lib/validations";
import { changeStatus } from "@/services/complaint.service";
type Params = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: Params) {
  try { const actor = await requireUser([Role.CITIZEN]); const input = await body(request, statusSchema.pick({ remarks: true })); return ok(await changeStatus(actor, (await params).id, ComplaintStatus.REOPENED, input.remarks)); }
  catch (error) { return errorResponse(error); }
}
