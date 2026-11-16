import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Transaction = Prisma.TransactionClient;
export async function notify(tx: Transaction, userId: string, title: string, body: string, href?: string, eventKey?: string) {
  await tx.notification.create({ data: { userId, title, body, href, eventKey } });
}
export async function listNotifications(userId: string, page = 1) {
  const [items, unread, total] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, skip: (page - 1) * 20, take: 20 }),
    prisma.notification.count({ where: { userId, readAt: null } }),
    prisma.notification.count({ where: { userId } })
  ]);
  return { items, unread, total, page };
}
