import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { currentUser } from "@/lib/permissions";
import { AppShell } from "@/components/layout/app-shell";
export default async function Layout({ children }: {children:React.ReactNode}) { const user=await currentUser(); if(!user) redirect("/login"); if(user.role!==Role.CITIZEN) redirect(user.role===Role.FIELD_WORKER?"/worker/dashboard":"/admin/dashboard"); return <AppShell role="citizen" name={user.name}>{children}</AppShell>; }
