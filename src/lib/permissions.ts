import { getServerSession } from "next-auth";
import { Role, type User } from "@prisma/client";
import { authOptions, DEMO_USERS } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { notFound } from "next/navigation";

export { AppError };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function currentUser(): Promise<User | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id && !session?.user?.email) return null;

  const rawId = session.user?.id;
  const isUuid = typeof rawId === "string" && UUID_REGEX.test(rawId);
  const email = session.user?.email?.toLowerCase().trim();

  try {
    let user: User | null = null;
    if (isUuid) {
      user = await prisma.user.findFirst({
        where: { id: rawId, isActive: true }
      });
    }
    if (!user && email) {
      user = await prisma.user.findUnique({
        where: { email }
      });
    }
    if (user && user.isActive) {
      return user;
    }
  } catch (err: any) {
    console.warn("[Permissions] Database unreachable, falling back to session user:", err?.message || err);
  }

  // Graceful fallback for demo accounts and active JWT sessions
  const role = ((session.user as any)?.role as Role) || Role.CITIZEN;
  const fallbackId = isUuid ? rawId : (email && DEMO_USERS[email]?.id ? DEMO_USERS[email].id : "00000000-0000-0000-0000-000000000004");
  return {
    id: fallbackId,
    name: session.user?.name || "User",
    email: email || "demo@techflow.example",
    role,
    isActive: true,
    sessionVersion: session.user?.sessionVersion || 1,
    phone: "+91 98765 43210",
    departmentId: role === Role.DEPARTMENT_ADMIN ? "dept-roads-01" : null,
    passwordHash: "",
    createdAt: new Date(),
    updatedAt: new Date()
  } as User;
}

export async function requireUser(roles?: Role[]): Promise<User> {
  const user = await currentUser();
  if (!user) throw new AppError(401, "Authentication required");
  if (roles && !roles.includes(user.role)) throw new AppError(403, "Access denied");
  return user;
}

export function canManageDepartment(user: User, departmentId: string) {
  return (
    user.role === Role.SUPER_ADMIN ||
    (user.role === Role.DEPARTMENT_ADMIN && user.departmentId === departmentId)
  );
}

export async function requireSuperAdminPage() {
  const user = await currentUser();
  if (!user || user.role !== Role.SUPER_ADMIN) notFound();
  return user;
}
