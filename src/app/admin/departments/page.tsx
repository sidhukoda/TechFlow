import { requireSuperAdminPage } from "@/lib/permissions";
import { DepartmentManager } from "@/components/admin/department-manager";
export default async function Page(){await requireSuperAdminPage();return <><h1 className="text-3xl font-bold">Departments</h1><p className="muted mb-8 mt-2">Manage the teams responsible for public issues.</p><DepartmentManager/></>}
