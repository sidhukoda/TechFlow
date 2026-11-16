import { Priority, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
const schema = z.object({ priority: z.nativeEnum(Priority), hours: z.number().int().min(1).max(8760), departmentId: z.string().uuid().nullable().optional() });
export async function GET() { try { await requireUser([Role.SUPER_ADMIN]); return ok(await prisma.slaPolicy.findMany({ include: { department: true }, orderBy: { priority: "asc" } })); } catch (error) { return errorResponse(error); } }
export async function POST(request: Request) {
  try { const actor = await requireUser([Role.SUPER_ADMIN]); const input = await body(request, schema); return ok(await prisma.$transaction(async tx => { const existing = await tx.slaPolicy.findFirst({ where: { priority: input.priority, departmentId: input.departmentId ?? null } }); const item = existing ? await tx.slaPolicy.update({ where: { id: existing.id }, data: { hours: input.hours } }) : await tx.slaPolicy.create({ data: { ...input, departmentId: input.departmentId ?? null } }); await tx.auditLog.create({ data: { actorId: actor.id, action: "SLA_UPDATE", entityType: "sla_policy", entityId: item.id } }); return item; })); }
  catch (error) { return errorResponse(error); }
}
