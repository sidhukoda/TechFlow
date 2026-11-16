import { randomUUID } from "node:crypto";
import { body, errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";
import { setupCloudinary } from "@/lib/cloudinary";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
const schema = z.object({ kind: z.enum(["COMPLAINT", "PROGRESS", "COMPLETION"]) });
export async function POST(request: Request) {
  try {
    const actor = await requireUser(); await rateLimit(`upload:${actor.id}`, 30, 60); await body(request, schema);
    const client = setupCloudinary(); const timestamp = Math.floor(Date.now() / 1000);
    const folder = `techflow/${actor.id}`; const public_id = randomUUID();
    const params = { timestamp, folder, public_id, allowed_formats: "jpg,jpeg,png,webp", max_file_size: 5000000 };
    const signature = client.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
    return ok({ ...params, signature, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
  } catch (error) { return errorResponse(error); }
}
