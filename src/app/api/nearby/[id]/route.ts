import { prisma } from "@/lib/prisma";
import { errorResponse, ok } from "@/lib/http";
import { AppError } from "@/lib/permissions";
type Params={params:Promise<{id:string}>};
export async function GET(_request:Request,{params}:Params){try{const item=await prisma.complaint.findFirst({where:{id:(await params).id,deletedAt:null},select:{id:true,ticketNumber:true,title:true,status:true,createdAt:true,category:{select:{name:true}},department:{select:{name:true}},_count:{select:{supports:true}}}});if(!item)throw new AppError(404,"Report not found");return ok(item);}catch(error){return errorResponse(error);}}
