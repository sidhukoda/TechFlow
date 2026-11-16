import { randomBytes, createHash } from "node:crypto";
import { z } from "zod";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { rateLimit, requestIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email().transform(v => v.toLowerCase().trim()) });
export async function POST(request: Request) {
  try {
    await rateLimit(`reset:${requestIp(request)}`, 5, 60);
    const { email } = await body(request, schema);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.isActive && process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.APP_URL) {
      try {
        const token = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(token).digest("hex");
        await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 15 * 60000) } });
        const url = `${process.env.APP_URL}/reset-password?token=${token}`;
        await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.EMAIL_FROM, to: email, subject: "Reset your TechFlow password", text: `Use this link within 15 minutes: ${url}` });
      } catch (error) { console.error("Password reset email could not be sent", error); }
    }
    return ok({ message: "If an account exists, a reset link has been sent." });
  } catch (error) { return errorResponse(error); }
}
