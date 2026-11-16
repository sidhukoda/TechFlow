import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { currentUser } from "@/lib/permissions";
import { AppShell } from "@/components/layout/app-shell";
export default async function Layout({ children }: {children:React.ReactNode}) { const user=await currentUser(); if(!user) redirect("/login"); if(user.role!==Role.SUPER_ADMIN&&user.role!==Role.DEPARTMENT_ADMIN) redirect(user.role===Role.CITIZEN?"/citizen/dashboard":"/worker/dashboard"); return <AppShell role="admin" name={user.name} superAdmin={user.role===Role.SUPER_ADMIN}>{children}</AppShell>; }
