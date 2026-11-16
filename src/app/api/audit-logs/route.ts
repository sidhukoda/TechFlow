import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
export async function GET(request: Request) {
  try { await requireUser([Role.SUPER_ADMIN]); const page = Math.max(1, Number(new URL(request.url).searchParams.get("page")) || 1); const [items, total] = await Promise.all([prisma.auditLog.findMany({ include: { actor: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * 30, take: 30 }), prisma.auditLog.count()]); return ok({ items, total, page }); }
  catch (error) { return errorResponse(error); }
}
