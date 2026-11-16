import { errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
import { getComplaint } from "@/services/complaint.service";
type Params = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Params) {
  try { return ok((await getComplaint(await requireUser(), (await params).id)).history); }
  catch (error) { return errorResponse(error); }
}
