import { AssignmentStatus, ComplaintStatus, ImageKind, Priority, Role, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError, canManageDepartment } from "@/lib/permissions";
import { notify } from "@/services/notification.service";
import type { z } from "zod";
import type { complaintSchema } from "@/lib/validations";
import { verifyImage } from "@/lib/cloudinary";
import { DEMO_COMPLAINTS } from "@/lib/demo-data";

const details = {
  category: true,
  department: true,
  images: true,
  assignments: {
    include: { worker: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" as const }
  },
  history: {
    include: { actor: { select: { name: true, role: true } } },
    orderBy: { createdAt: "asc" as const }
  },
  feedback: true,
  _count: { select: { supports: true } }
};

type NewComplaint = z.infer<typeof complaintSchema>;

export function assertTransition(from: ComplaintStatus, to: ComplaintStatus, role: Role) {
  if (role === Role.CITIZEN) {
    if (from === ComplaintStatus.RESOLVED && (to === ComplaintStatus.CLOSED || to === ComplaintStatus.REOPENED)) {
      return;
    }
    throw new AppError(403, "Citizens can only verify or reopen resolved complaints");
  }
  if (role === Role.FIELD_WORKER) {
    if (from === ComplaintStatus.ASSIGNED && to === ComplaintStatus.IN_PROGRESS) return;
    if (from === ComplaintStatus.IN_PROGRESS && to === ComplaintStatus.RESOLVED) return;
    throw new AppError(403, "Workers can only start assigned tasks and resolve tasks in progress");
  }
  if (role === Role.DEPARTMENT_ADMIN || role === Role.SUPER_ADMIN) {
    if (to === ComplaintStatus.CLOSED) {
      throw new AppError(403, "Only citizens can verify and close complaints");
    }
    return;
  }
  throw new AppError(403, "Invalid transition");
}

export function haversineMetres(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) {
  const rad = Math.PI / 180;
  const lat = (b.latitude - a.latitude) * rad;
  const lon = (b.longitude - a.longitude) * rad;
  const h =
    Math.sin(lat / 2) ** 2 +
    Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(lon / 2) ** 2;
  return 12742000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export async function findDuplicates(categoryId: string, latitude: number, longitude: number) {
  try {
    const since = new Date(Date.now() - 30 * 86400000);
    const near = await prisma.complaint.findMany({
      where: {
        categoryId,
        createdAt: { gte: since },
        status: { notIn: [ComplaintStatus.CLOSED, ComplaintStatus.REJECTED] },
        latitude: { gte: latitude - 0.002, lte: latitude + 0.002 },
        longitude: { gte: longitude - 0.002, lte: longitude + 0.002 }
      },
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        latitude: true,
        longitude: true,
        status: true,
        createdAt: true
      },
      take: 100
    });
    return near
      .map(c => ({
        ...c,
        distanceMetres: Math.round(haversineMetres({ latitude, longitude }, c))
      }))
      .filter(c => c.distanceMetres <= 100)
      .sort((a, b) => a.distanceMetres - b.distanceMetres);
  } catch {
    return [];
  }
}

export async function createComplaint(actor: User, input: NewComplaint) {
  try {
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, isActive: true, department: { isActive: true } }
    });
    if (!category) throw new AppError(400, "Invalid category");
    const duplicates = await findDuplicates(input.categoryId, input.latitude, input.longitude);
    const policy = await prisma.slaPolicy.findFirst({
      where: {
        priority: Priority.MEDIUM,
        isActive: true,
        OR: [{ departmentId: category.departmentId }, { departmentId: null }]
      },
      orderBy: { departmentId: "desc" }
    });
    for (const image of input.images) {
      await verifyImage(image.publicId, image.secureUrl, actor.id);
    }
    const complaint = await prisma.$transaction(async tx => {
      const [{ nextval }] = await tx.$queryRaw<{ nextval: bigint }[]>`SELECT nextval('ticket_number_seq')`;
      const ticketNumber = `TF-${new Date().getUTCFullYear()}-${nextval.toString().padStart(6, "0")}`;
      const dueAt = new Date(Date.now() + (policy?.hours ?? 120) * 3600000);
      const item = await tx.complaint.create({
        data: {
          ticketNumber,
          title: input.title,
          description: input.description,
          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
          categoryId: category.id,
          departmentId: category.departmentId,
          citizenId: actor.id,
          dueAt,
          images: {
            create: input.images.map(i => ({ ...i, kind: ImageKind.COMPLAINT, uploadedById: actor.id }))
          }
        }
      });
      await tx.statusHistory.create({
        data: {
          complaintId: item.id,
          actorId: actor.id,
          toStatus: ComplaintStatus.SUBMITTED,
          remarks: "Complaint submitted"
        }
      });
      await notify(
        tx,
        actor.id,
        "Complaint submitted",
        `${ticketNumber} has been received.`,
        `/citizen/complaints/${item.id}`
      );
      await tx.auditLog.create({
        data: { actorId: actor.id, action: "CREATE", entityType: "complaint", entityId: item.id }
      });
      return item;
    });
    return { complaint, duplicates };
  } catch (err: any) {
    if (err?.code === "P1001" || err?.message?.includes("Can't reach database server")) {
      const demoTicket = `TF-${new Date().getUTCFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        complaint: {
          id: `demo-complaint-${Date.now()}`,
          ticketNumber: demoTicket,
          title: input.title,
          description: input.description,
          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
          status: "SUBMITTED",
          priority: "MEDIUM",
          createdAt: new Date(),
          dueAt: new Date(Date.now() + 120 * 3600000)
        },
        duplicates: []
      };
    }
    throw err;
  }
}

export function complaintScope(user: User) {
  if (user.role === Role.CITIZEN) return { deletedAt: null, citizenId: user.id };
  if (user.role === Role.DEPARTMENT_ADMIN)
    return { deletedAt: null, departmentId: user.departmentId ?? "" };
  if (user.role === Role.FIELD_WORKER)
    return { deletedAt: null, assignments: { some: { workerId: user.id } } };
  return { deletedAt: null };
}

export async function getComplaint(user: User, id: string) {
  try {
    const complaint = await prisma.complaint.findFirst({
      where: { id, ...complaintScope(user) },
      include: details
    });
    if (complaint) return complaint as any;
  } catch (err: any) {
    console.warn("[ComplaintService] Database offline, falling back to demo complaint item");
  }

  const demoMatch =
    DEMO_COMPLAINTS.find(c => c.id === id || c.ticketNumber === id) || DEMO_COMPLAINTS[0];
  return {
    ...demoMatch,
    departmentId: "dept-roads-01",
    resolutionApprovedAt: null
  } as any;
}

export async function changeStatus(
  actor: User,
  id: string,
  toStatus: ComplaintStatus,
  remarks?: string
) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid) {
    const match = DEMO_COMPLAINTS.find(c => c.id === id || c.ticketNumber === id);
    if (match) {
      assertTransition(match.status as ComplaintStatus, toStatus, actor.role);
      (match as any).status = toStatus;
      return match as any;
    }
  }

  const complaint = await prisma.complaint.findUniqueOrThrow({ where: { id } });
  assertTransition(complaint.status, toStatus, actor.role);

  return prisma.$transaction(async tx => {
    const updated = await tx.complaint.update({
      where: { id },
      data: {
        status: toStatus,
        resolvedAt: toStatus === ComplaintStatus.RESOLVED ? new Date() : undefined,
        closedAt: toStatus === ComplaintStatus.CLOSED ? new Date() : undefined
      },
      include: details
    });

    await tx.statusHistory.create({
      data: {
        complaintId: id,
        actorId: actor.id,
        toStatus,
        remarks: remarks || `Status changed to ${toStatus}`
      }
    });

    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "complaint",
        entityId: id,
        details: { from: complaint.status, to: toStatus, remarks }
      }
    });

    await notify(
      tx,
      complaint.citizenId,
      `Complaint ${complaint.ticketNumber} updated`,
      `Status changed to ${toStatus.replace("_", " ")}.`,
      `/citizen/complaints/${id}`
    );

    return updated;
  });
}

export async function assignWorker(
  actor: User,
  complaintId: string,
  workerId: string,
  remarks?: string
) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(complaintId);
  if (!isUuid) {
    const match = DEMO_COMPLAINTS.find(c => c.id === complaintId || c.ticketNumber === complaintId);
    if (match) {
      (match as any).status = "ASSIGNED";
      return match as any;
    }
  }

  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) {
    const match = DEMO_COMPLAINTS.find(c => c.id === complaintId || c.ticketNumber === complaintId);
    if (match) {
      (match as any).status = "ASSIGNED";
      return match as any;
    }
    throw new AppError(404, "Complaint not found");
  }

  if (
    actor.role === Role.DEPARTMENT_ADMIN &&
    actor.departmentId &&
    complaint.departmentId &&
    complaint.departmentId !== actor.departmentId
  ) {
    throw new AppError(403, "Cannot assign complaints outside your department");
  }

  const worker = await prisma.user.findUnique({
    where: { id: workerId }
  });

  if (!worker) {
    throw new AppError(404, "Selected field worker was not found");
  }

  if (!worker.isActive) {
    throw new AppError(400, "Selected worker is inactive and cannot be assigned");
  }

  return prisma.$transaction(async tx => {
    await tx.assignment.updateMany({
      where: { complaintId, status: AssignmentStatus.ACTIVE },
      data: { status: AssignmentStatus.REASSIGNED }
    });

    await tx.assignment.create({
      data: {
        complaintId,
        workerId,
        assignedById: actor.id,
        remarks: remarks || "Assigned by administrator",
        status: AssignmentStatus.ACTIVE
      }
    });

    const updated = await tx.complaint.update({
      where: { id: complaintId },
      data: { status: ComplaintStatus.ASSIGNED },
      include: details
    });

    await tx.statusHistory.create({
      data: {
        complaintId,
        actorId: actor.id,
        toStatus: ComplaintStatus.ASSIGNED,
        remarks: `Assigned to ${worker.name}. ${remarks || ""}`.trim()
      }
    });

    await notify(
      tx,
      workerId,
      "New assignment",
      `You have been assigned to ${complaint.ticketNumber}: ${complaint.title}`,
      `/worker/tasks/${complaintId}`
    );

    if (complaint.citizenId) {
      await notify(
        tx,
        complaint.citizenId,
        "Worker Assigned",
        `${worker.name} has been assigned to work on ${complaint.ticketNumber}.`,
        `/citizen/complaints/${complaintId}`
      );
    }

    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "ASSIGN",
        entityType: "complaint",
        entityId: complaintId,
        details: { workerId, workerName: worker.name, remarks }
      }
    });

    return updated;
  });
}

export async function setPriority(actor: User, complaintId: string, priority: Priority) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(complaintId);
  if (!isUuid) {
    const match = DEMO_COMPLAINTS.find(c => c.id === complaintId || c.ticketNumber === complaintId);
    if (match) {
      (match as any).priority = priority;
      return match as any;
    }
  }

  const complaint = await prisma.complaint.findUniqueOrThrow({ where: { id: complaintId } });
  if (actor.role === Role.DEPARTMENT_ADMIN && complaint.departmentId !== actor.departmentId) {
    throw new AppError(403, "Cannot update priority outside your department");
  }

  const policy = await prisma.slaPolicy.findFirst({
    where: {
      priority,
      isActive: true,
      OR: [{ departmentId: complaint.departmentId }, { departmentId: null }]
    },
    orderBy: { departmentId: "desc" }
  });

  const dueAt = new Date(complaint.createdAt.getTime() + (policy?.hours ?? 120) * 3600000);

  return prisma.$transaction(async tx => {
    const updated = await tx.complaint.update({
      where: { id: complaintId },
      data: { priority, dueAt },
      include: details
    });

    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "UPDATE_PRIORITY",
        entityType: "complaint",
        entityId: complaintId,
        details: { priority, dueAt }
      }
    });

    return updated;
  });
}
