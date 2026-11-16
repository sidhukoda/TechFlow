import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Tag, Building2, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SupportButton } from "@/components/complaints/support-button";
import { formatDate } from "@/lib/utils";

export default async function Nearby({ params }: { params: Promise<{ id: string }> }) {
  const item = await prisma.complaint.findFirst({
    where: { id: (await params).id, deletedAt: null },
    select: {
      id: true,
      ticketNumber: true,
      title: true,
      status: true,
      createdAt: true,
      category: { select: { name: true } },
      department: { select: { name: true } },
      _count: { select: { supports: true } }
    }
  });

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/citizen/dashboard"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-card transition hover:bg-slate-50"
      >
        <ArrowLeft size={14} />
        <span>Back to dashboard</span>
      </Link>

      <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 sm:p-8 shadow-card">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <span className="font-mono text-xs font-bold text-blue-600">
            {item.ticketNumber}
          </span>
          <Badge value={item.status} />
        </div>

        <h1 className="mt-4 font-heading text-xl sm:text-2xl font-bold text-[#0F1A2C]">
          {item.title}
        </h1>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Tag size={13} className="text-blue-600" />
            {item.category.name}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Building2 size={13} className="text-blue-600" />
            {item.department.name}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar size={13} className="text-blue-600" />
            {formatDate(item.createdAt)}
          </span>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Users size={16} className="text-blue-600" />
            <span>
              <strong className="text-[#0F1A2C]">{item._count.supports}</strong> citizens support this civic issue
            </span>
          </div>
          <SupportButton id={item.id} />
        </div>
      </div>
    </div>
  );
}
