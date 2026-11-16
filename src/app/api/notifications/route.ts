import { errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
import { listNotifications } from "@/services/notification.service";
export async function GET(request: Request) {
  try { const actor = await requireUser(); const page = Math.max(1, Number(new URL(request.url).searchParams.get("page")) || 1); return ok(await listNotifications(actor.id, page)); }
  catch (error) { return errorResponse(error); }
}
