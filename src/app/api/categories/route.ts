import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { AppError, currentUser, requireUser } from "@/lib/permissions";
import { categorySchema } from "@/lib/validations";
import { DEMO_CATEGORIES } from "@/lib/demo-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId") || undefined;
    const all = searchParams.get("all") === "true";

    const user = await currentUser();
    const canSeeAll = Boolean(all && user && (user.role === Role.SUPER_ADMIN || user.role === Role.DEPARTMENT_ADMIN));

    const where = {
      ...(departmentId ? { departmentId } : {}),
      ...(canSeeAll ? {} : { isActive: true, department: { isActive: true } })
    };

    const categories = await prisma.category.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, slug: true, isActive: true } },
        _count: { select: { complaints: true } }
      },
      orderBy: { name: "asc" }
    });

    return ok(categories, 200, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" }
    });
  } catch (error) {
    console.warn("[Categories API] Database offline, returning demo categories");
    return ok(DEMO_CATEGORIES, 200, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" }
    });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireUser([Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN]);
    const data = await body(request, categorySchema);

    if (actor.role === Role.DEPARTMENT_ADMIN && actor.departmentId && data.departmentId !== actor.departmentId) {
      throw new AppError(403, "You can only create categories for your assigned department");
    }

    const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
    if (!department) {
      throw new AppError(404, "Selected department not found");
    }

    let baseSlug = (data.slug?.trim() || data.name.toLowerCase().replaceAll("&", "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) || "category";
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const item = await prisma.$transaction(async tx => {
      const created = await tx.category.create({
        data: {
          name: data.name.trim(),
          slug,
          departmentId: data.departmentId,
          isActive: data.isActive ?? true
        },
        include: {
          department: { select: { id: true, name: true, slug: true } },
          _count: { select: { complaints: true } }
        }
      });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "CREATE",
          entityType: "category",
          entityId: created.id,
          details: { name: created.name, departmentId: created.departmentId, slug: created.slug }
        }
      });
      return created;
    });

    return ok(item, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
