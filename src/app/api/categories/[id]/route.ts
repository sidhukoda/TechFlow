import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { AppError, requireUser } from "@/lib/permissions";
import { categoryUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await requireUser([Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN]);
    const id = (await params).id;
    const data = await body(request, categoryUpdateSchema);

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Category not found");

    if (actor.role === Role.DEPARTMENT_ADMIN && actor.departmentId && existing.departmentId !== actor.departmentId) {
      throw new AppError(403, "You can only modify categories within your assigned department");
    }

    if (data.departmentId && actor.role === Role.DEPARTMENT_ADMIN && data.departmentId !== actor.departmentId) {
      throw new AppError(403, "Cannot transfer category outside your department");
    }

    const item = await prisma.$transaction(async tx => {
      const updated = await tx.category.update({
        where: { id },
        data: {
          ...(data.name ? { name: data.name.trim() } : {}),
          ...(data.slug ? { slug: data.slug.trim() } : {}),
          ...(data.departmentId ? { departmentId: data.departmentId } : {}),
          ...(typeof data.isActive === "boolean" ? { isActive: data.isActive } : {})
        },
        include: {
          department: { select: { id: true, name: true, slug: true } },
          _count: { select: { complaints: true } }
        }
      });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "UPDATE",
          entityType: "category",
          entityId: id,
          details: data
        }
      });
      return updated;
    });

    return ok(item);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const actor = await requireUser([Role.SUPER_ADMIN]);
    const id = (await params).id;

    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { complaints: true } } }
    });
    if (!existing) throw new AppError(404, "Category not found");

    if (existing._count.complaints > 0) {
      const updated = await prisma.category.update({
        where: { id },
        data: { isActive: false },
        include: { department: { select: { id: true, name: true } } }
      });
      await prisma.auditLog.create({
        data: {
          actorId: actor.id,
          action: "UPDATE",
          entityType: "category",
          entityId: id,
          details: { message: "Deactivated category due to existing complaints", complaintsCount: existing._count.complaints }
        }
      });
      return ok({
        message: `Category has ${existing._count.complaints} complaint(s) linked and was deactivated instead of deleted.`,
        item: updated,
        deactivated: true
      });
    }

    await prisma.$transaction(async tx => {
      await tx.category.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "DELETE",
          entityType: "category",
          entityId: id
        }
      });
    });

    return ok({ success: true, deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
