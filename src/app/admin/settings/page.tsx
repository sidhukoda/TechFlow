import { requireSuperAdminPage } from "@/lib/permissions";
import { SlaManager } from "@/components/admin/sla-manager";

export default async function SettingsPage() {
  await requireSuperAdminPage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
          SLA & Operational Thresholds
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Establish service level agreements, resolution timeframes, and automated breach alerting rules
        </p>
      </div>

      <SlaManager />
    </div>
  );
}
