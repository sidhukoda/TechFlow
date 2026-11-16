import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  note,
  icon: Icon
}: {
  label: string;
  value: number | string;
  note?: string;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <Card className="p-5 border border-[#E2E8F0]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[#08254F]">{value}</p>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </Card>
  );
}
