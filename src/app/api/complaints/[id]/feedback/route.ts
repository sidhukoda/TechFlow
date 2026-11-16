import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { AppError, requireUser } from "@/lib/permissions";
import { feedbackSchema } from "@/lib/validations";
import { getComplaint } from "@/services/complaint.service";
type Params = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: Params) {
  try {
    const actor = await requireUser([Role.CITIZEN]); const id = (await params).id;
    const complaint = await getComplaint(actor, id);
    if (complaint.status !== "CLOSED") throw new AppError(409, "Feedback is available after verification");
    const input = await body(request, feedbackSchema);
    return ok(await prisma.feedback.upsert({ where: { complaintId: id }, create: { complaintId: id, citizenId: actor.id, ...input }, update: input }), 201);
  } catch (error) { return errorResponse(error); }
}
