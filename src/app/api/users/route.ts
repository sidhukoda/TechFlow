import { Role, Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
import { staffSchema } from "@/lib/validations";
export async function GET(request: Request) {
  try { await requireUser([Role.SUPER_ADMIN]); const p = new URL(request.url).searchParams; const page = Math.max(1, Number(p.get("page")) || 1); const where: Prisma.UserWhereInput = p.get("q") ? { OR: [{ name: { contains: p.get("q")!, mode: "insensitive" } }, { email: { contains: p.get("q")!, mode: "insensitive" } }] } : {}; const [items,total] = await Promise.all([prisma.user.findMany({ where, select: { id: true, name: true, email: true, role: true, isActive: true, department: { select: { name: true } }, createdAt: true }, skip: (page - 1) * 20, take: 20, orderBy: { createdAt: "desc" } }), prisma.user.count({ where })]); return ok({ items, total, page }); }
  catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try { const actor = await requireUser([Role.SUPER_ADMIN]); const input = await body(request, staffSchema); const passwordHash = await hash(input.password, 12); return ok(await prisma.$transaction(async tx => { const item = await tx.user.create({ data: { name: input.name, email: input.email, phone: input.phone, departmentId: input.departmentId, passwordHash, role: Role.DEPARTMENT_ADMIN }, select: { id: true, name: true, email: true, role: true } }); await tx.auditLog.create({ data: { actorId: actor.id, action: "CREATE", entityType: "user", entityId: item.id } }); return item; }), 201); }
  catch (error) { return errorResponse(error); }
}
