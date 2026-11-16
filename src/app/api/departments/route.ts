import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
import { departmentSchema } from "@/lib/validations";
import { DEMO_DEPARTMENTS } from "@/lib/demo-data";

export async function GET() {
  try {
    await requireUser();
    return ok(
      await prisma.department.findMany({
        include: {
          categories: {
            include: { _count: { select: { complaints: true } } },
            orderBy: { name: "asc" }
          },
          _count: { select: { users: true, complaints: true, categories: true } }
        },
        orderBy: { name: "asc" }
      }),
      200,
      { headers: { "Cache-Control": "private, s-maxage=120, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.warn("[Departments API] Database offline, returning demo departments");
    return ok(
      DEMO_DEPARTMENTS.map(d => ({
        ...d,
        categories: [],
        _count: { users: 4, complaints: 120, categories: 3 }
      })),
      200,
      { headers: { "Cache-Control": "private, s-maxage=120, stale-while-revalidate=300" } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireUser([Role.SUPER_ADMIN]);
    const data = await body(request, departmentSchema);
    return ok(
      await prisma.$transaction(async tx => {
        const item = await tx.department.create({ data });
        await tx.auditLog.create({
          data: { actorId: actor.id, action: "CREATE", entityType: "department", entityId: item.id }
        });
        return item;
      }),
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
