import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PaginationBar({
  page,
  total,
  pageSize = 10,
  base,
  params = {}
}: {
  page: number;
  total: number;
  pageSize?: number;
  base: string;
  params?: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function buildUrl(targetPage: number) {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(targetPage));
    Object.entries(params).forEach(([k, v]) => {
      if (v) searchParams.set(k, v);
    });
    return `${base}?${searchParams.toString()}`;
  }

  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="text-xs font-medium text-slate-400">
        Showing <span className="font-semibold text-slate-700">{(page - 1) * pageSize + 1}</span> to{" "}
        <span className="font-semibold text-slate-700">{Math.min(page * pageSize, total)}</span> of{" "}
        <span className="font-semibold text-slate-700">{total}</span> items
      </p>

      <div className="flex items-center gap-2">
        <Link
          href={buildUrl(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-card transition ${
            page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-50 hover:text-slate-900"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </Link>

        <span className="px-3 text-xs font-semibold text-[#0F1A2C]">
          Page {page} of {totalPages}
        </span>

        <Link
          href={buildUrl(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-card transition ${
            page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-50 hover:text-slate-900"
          }`}
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}
