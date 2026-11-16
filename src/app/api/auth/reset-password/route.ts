import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/permissions";
import { body, errorResponse, ok } from "@/lib/http";
import { rateLimit, requestIp } from "@/lib/rate-limit";

const schema = z.object({ token: z.string().length(64), password: z.string().min(12).max(128) });
export async function POST(request: Request) {
  try {
    await rateLimit(`reset-use:${requestIp(request)}`, 10, 60);
    const { token, password } = await body(request, schema);
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const passwordHash = await hash(password, 12);
    await prisma.$transaction(async tx => {
      const result = await tx.passwordResetToken.updateMany({ where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } });
      if (result.count !== 1) throw new AppError(400, "This reset link is invalid or expired");
      const reset = await tx.passwordResetToken.findUniqueOrThrow({ where: { tokenHash } });
      await tx.user.update({ where: { id: reset.userId }, data: { passwordHash, sessionVersion: { increment: 1 } } });
      await tx.passwordResetToken.deleteMany({ where: { userId: reset.userId, id: { not: reset.id } } });
      await tx.auditLog.create({ data: { actorId: reset.userId, action: "PASSWORD_RESET", entityType: "user", entityId: reset.userId } });
    });
    return ok({ message: "Password updated" });
  } catch (error) { return errorResponse(error); }
}
