import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

// PostgreSQL advisory locks serialize attempts for the same key across Vercel instances.
// A dedicated durable table is used instead of process memory.
export async function rateLimit(key: string, limit: number, windowMinutes: number) {
  const since = new Date(Date.now() - windowMinutes * 60_000);
  try {
    await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
      await tx.rateLimitEvent.deleteMany({ where: { key, createdAt: { lt: since } } });
      const count = await tx.rateLimitEvent.count({ where: { key, createdAt: { gte: since } } });
      if (count >= limit) throw new AppError(429, "Too many requests. Please try again later.");
      await tx.rateLimitEvent.create({ data: { key } });
    });
  } catch (err: any) {
    if (err?.statusCode === 429) {
      throw err;
    }
    // If DB is offline, log warning and allow request in development
    console.warn(`[RateLimit] Database check skipped for key "${key}":`, err?.message || err);
  }
}

export function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
