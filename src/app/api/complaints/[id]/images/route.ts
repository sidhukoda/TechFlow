import { ImageKind, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyImage } from "@/lib/cloudinary";
import { body, errorResponse, ok } from "@/lib/http";
import { AppError, requireUser } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({
  publicId: z.string().min(1),
  secureUrl: z.string().min(1),
  kind: z.nativeEnum(ImageKind)
});

export async function POST(request: Request, { params }: Params) {
  try {
    const actor = await requireUser([Role.FIELD_WORKER]);
    const id = (await params).id;
    const input = await body(request, schema);
    if (input.kind === ImageKind.COMPLAINT) throw new AppError(400, "Invalid image type");
    const complaint = await prisma.complaint.findFirst({
      where: {
        id,
        deletedAt: null,
        assignments: { some: { workerId: actor.id, status: "ACTIVE" } }
      }
    });
    if (!complaint) throw new AppError(403, "Not assigned to this complaint");
    await verifyImage(input.publicId, input.secureUrl, actor.id);
    return ok(
      await prisma.complaintImage.create({
        data: { ...input, complaintId: id, uploadedById: actor.id }
      }),
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
