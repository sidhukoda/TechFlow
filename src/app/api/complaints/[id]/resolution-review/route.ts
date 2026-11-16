import { ComplaintStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { body, errorResponse, ok } from "@/lib/http";
import { AppError, canManageDepartment, requireUser } from "@/lib/permissions";
import { changeStatus } from "@/services/complaint.service";
import { notify } from "@/services/notification.service";
type Params={params:Promise<{id:string}>};
const schema=z.object({approved:z.boolean(),remarks:z.string().trim().max(2000).optional()});
export async function POST(request:Request,{params}:Params){try{const actor=await requireUser([Role.SUPER_ADMIN,Role.DEPARTMENT_ADMIN]);const id=(await params).id;const input=await body(request,schema);const complaint=await prisma.complaint.findFirst({where:{id,deletedAt:null}});if(!complaint)throw new AppError(404,"Complaint not found");if(!canManageDepartment(actor,complaint.departmentId))throw new AppError(403,"Access denied");if(complaint.status!==ComplaintStatus.RESOLVED)throw new AppError(409,"Complaint is not awaiting evidence review");if(!input.approved){if(!input.remarks)throw new AppError(400,"Rejection remarks are required");return ok(await changeStatus(actor,id,ComplaintStatus.UNDER_REVIEW,input.remarks));}return ok(await prisma.$transaction(async tx=>{const result=await tx.complaint.updateMany({where:{id,status:ComplaintStatus.RESOLVED,resolutionApprovedAt:null},data:{resolutionApprovedAt:new Date()}});if(result.count!==1)throw new AppError(409,"Resolution already reviewed or status changed");const item=await tx.complaint.findUniqueOrThrow({where:{id}});await tx.auditLog.create({data:{actorId:actor.id,action:"RESOLUTION_APPROVED",entityType:"complaint",entityId:id,details:{remarks:input.remarks}}});await notify(tx,complaint.citizenId,"Resolution ready for verification",`${complaint.ticketNumber} has approved completion evidence. Please review the result.`,`/citizen/complaints/${id}`);return item;}));}catch(error){return errorResponse(error);}}
