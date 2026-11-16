import { requireSuperAdminPage } from "@/lib/permissions";
import { StaffManager } from "@/components/admin/staff-manager";

export default async function WorkersPage() {
  await requireSuperAdminPage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
          Field Operations Staff
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage field engineers, repair crews, and workload distribution across all municipal departments
        </p>
      </div>

      <StaffManager kind="workers" />
    </div>
  );
}
