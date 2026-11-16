"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
export function SupportButton({id}:{id:string}){const router=useRouter();const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");async function support(){setBusy(true);try{await api(`/api/complaints/${id}/support`,{method:"POST"});setMessage("Support recorded");router.refresh();}catch(e){setMessage(e instanceof Error?e.message:"Could not record support");}finally{setBusy(false);}}return <div><Button onClick={support} disabled={busy}>Support this report</Button>{message&&<p role="status" className="mt-3 text-sm text-slate-600">{message}</p>}</div>}
