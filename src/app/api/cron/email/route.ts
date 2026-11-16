import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { errorResponse, ok } from "@/lib/http";
import { AppError } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) throw new AppError(401, "Unauthorized");
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return ok({ sent: 0, skipped: "Email is not configured" });
    const resend = new Resend(process.env.RESEND_API_KEY);
    const pending = await prisma.notification.findMany({ where: { emailSentAt: null, emailAttempts: { lt: 3 } }, include: { user: { select: { email: true, isActive: true } } }, orderBy: { createdAt: "asc" }, take: 100 });
    let sent = 0;
    for (const item of pending) {
      const claim = await prisma.notification.updateMany({ where: { id: item.id, emailSentAt: null, emailAttempts: item.emailAttempts }, data: { emailAttempts: { increment: 1 } } });
      if (!claim.count || !item.user.isActive) continue;
      try {
        const result = await resend.emails.send({ from: process.env.EMAIL_FROM, to: item.user.email, subject: `TechFlow: ${item.title}`, text: `${item.body}${item.href ? `\n\n${process.env.APP_URL || ""}${item.href}` : ""}` });
        if (result.error) throw new Error(result.error.message);
        await prisma.notification.update({ where: { id: item.id }, data: { emailSentAt: new Date() } });
        sent++;
      } catch (error) { console.error("Notification email failed", item.id, error); }
    }
    return ok({ checked: pending.length, sent });
  } catch (error) { return errorResponse(error); }
}
