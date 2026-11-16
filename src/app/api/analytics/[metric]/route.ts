import { Role } from "@prisma/client";
import { errorResponse, ok } from "@/lib/http";
import { AppError, requireUser } from "@/lib/permissions";
import * as analytics from "@/services/analytics.service";
type Params = { params: Promise<{ metric: string }> };
export async function GET(_request: Request, { params }: Params) {
  try { const actor = await requireUser([Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN]); const metric = (await params).metric; if (metric === "overview") return ok(await analytics.overview(actor)); if (metric === "categories") return ok(await analytics.categories(actor)); if (metric === "departments") return ok(await analytics.departments(actor)); if (metric === "monthly") return ok(await analytics.monthly(actor)); if (metric === "workers") return ok(await analytics.workerWorkload(actor)); throw new AppError(404, "Unknown metric"); }
  catch (error) { return errorResponse(error); }
}
