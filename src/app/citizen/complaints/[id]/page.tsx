import { requireUser } from "@/lib/permissions";
import { getComplaint } from "@/services/complaint.service";
import { ComplaintDetail } from "@/components/complaints/complaint-detail";
export default async function Page({params}:{params:Promise<{id:string}>}){const item=await getComplaint(await requireUser(),(await params).id);return <ComplaintDetail item={item} role="citizen"/>;}
