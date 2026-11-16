import { z } from "zod";
import { errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
import { findDuplicates } from "@/services/complaint.service";
const schema = z.object({ categoryId: z.string().uuid(), latitude: z.coerce.number().min(-90).max(90), longitude: z.coerce.number().min(-180).max(180) });
export async function GET(request: Request) {
  try { await requireUser(); const input = schema.parse(Object.fromEntries(new URL(request.url).searchParams)); return ok(await findDuplicates(input.categoryId, input.latitude, input.longitude)); }
  catch (error) { return errorResponse(error); }
}
