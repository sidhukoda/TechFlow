import { prisma } from "@/lib/prisma";
import { errorResponse, ok } from "@/lib/http";
import { AppError } from "@/lib/permissions";
type Params = { params: Promise<{ ticket: string }> };
export async function GET(_request: Request, { params }: Params) {
  try {
    const ticket = (await params).ticket.toUpperCase();
    if (!/^TF-\d{4}-\d{6,}$/.test(ticket)) throw new AppError(400, "Invalid ticket number");
    const item = await prisma.complaint.findFirst({ where: { ticketNumber: ticket, deletedAt: null }, select: { ticketNumber: true, title: true, status: true, priority: true, createdAt: true, resolvedAt: true, category: { select: { name: true } }, department: { select: { name: true } }, history: { select: { toStatus: true, createdAt: true }, orderBy: { createdAt: "asc" } } } });
    if (!item) throw new AppError(404, "Ticket not found");
    return ok(item);
  } catch (error) { return errorResponse(error); }
}
