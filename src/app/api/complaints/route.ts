import { ComplaintStatus, Role, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
import { complaintSchema } from "@/lib/validations";
import { complaintScope, createComplaint } from "@/services/complaint.service";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  try {
    const actor = await requireUser();
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Number(params.get("page")) || 1);
    const take = Math.min(50, Math.max(1, Number(params.get("limit")) || 10));
    const status = params.get("status");
    const where: Prisma.ComplaintWhereInput = { ...complaintScope(actor), ...(status && Object.values(ComplaintStatus).includes(status as ComplaintStatus) ? { status: status as ComplaintStatus } : {}), ...(params.get("categoryId") ? { categoryId: params.get("categoryId")! } : {}), ...(params.get("q") ? { OR: [{ ticketNumber: { contains: params.get("q")!, mode: "insensitive" } }, { title: { contains: params.get("q")!, mode: "insensitive" } }] } : {}) };
    const [items, total] = await Promise.all([prisma.complaint.findMany({ where, include: { category: true, department: true, _count: { select: { supports: true } } }, orderBy: { createdAt: params.get("sort") === "oldest" ? "asc" : "desc" }, skip: (page - 1) * take, take }), prisma.complaint.count({ where })]);
    return ok({ items, total, page, pages: Math.ceil(total / take) });
  } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try { const actor = await requireUser([Role.CITIZEN]); await rateLimit(`complaint:${actor.id}`, 10, 60); return ok(await createComplaint(actor, await body(request, complaintSchema)), 201); }
  catch (error) { return errorResponse(error); }
}
