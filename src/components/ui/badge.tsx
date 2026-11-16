import { cn, readable } from "@/lib/utils";

export function Badge({ value, className }: { value: string; className?: string }) {
  const upper = value?.toUpperCase() || "";

  const isSuccess = upper === "CLOSED" || upper === "RESOLVED" || upper === "COMPLETED";
  const isDanger = upper === "REJECTED" || upper === "CRITICAL";
  const isInfo = upper === "IN_PROGRESS" || upper === "ASSIGNED" || upper === "HIGH";
  const isWarning = upper === "SUBMITTED" || upper === "UNDER_REVIEW" || upper === "REOPENED" || upper === "MEDIUM";

  const colorStyles = isSuccess
    ? "border-emerald-100 bg-[#EAF7EE] text-[#16A34A]"
    : isDanger
    ? "border-rose-100 bg-[#FFF0F2] text-[#E11D48]"
    : isInfo
    ? "border-blue-100 bg-[#EEF4FE] text-[#1A6BFF]"
    : isWarning
    ? "border-amber-100 bg-[#FFF7ED] text-[#D97706]"
    : "border-slate-100 bg-slate-100 text-slate-700";

  const dotColor = isSuccess
    ? "bg-[#16A34A]"
    : isDanger
    ? "bg-[#E11D48]"
    : isInfo
    ? "bg-[#1A6BFF]"
    : isWarning
    ? "bg-[#D97706]"
    : "bg-slate-400";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-normal",
        colorStyles,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotColor)} aria-hidden="true" />
      <span>{readable(value)}</span>
    </span>
  );
}
