import { requireSuperAdminPage } from "@/lib/permissions";
import { StaffManager } from "@/components/admin/staff-manager";

export default async function UsersPage() {
  await requireSuperAdminPage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
          User & Administrator Management
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Provision department administrator credentials, assign jurisdictions, and manage operational permissions
        </p>
      </div>

      <StaffManager kind="users" />
    </div>
  );
}
