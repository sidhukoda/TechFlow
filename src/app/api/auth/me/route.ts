import { errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
export async function GET() {
  try { const { id, name, email, role, phone, departmentId } = await requireUser(); return ok({ id, name, email, role, phone, departmentId }); }
  catch (error) { return errorResponse(error); }
}
