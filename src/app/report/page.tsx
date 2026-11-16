import { redirect } from "next/navigation";
import { currentUser } from "@/lib/permissions";
export default async function Report(){const user=await currentUser();redirect(user?.role==="CITIZEN"?"/citizen/new-complaint":"/register");}
