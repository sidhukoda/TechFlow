import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/permissions";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp"
]);

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export async function POST(request: Request) {
  try {
    const actor = await requireUser();
    await rateLimit(`upload:${actor.id}`, 60, 60);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const fileNameLower = (file.name || "").toLowerCase();
    const typeLower = (file.type || "").toLowerCase();

    // Determine extension from MIME or file name
    let ext = EXT_MAP[typeLower];
    if (!ext) {
      if (fileNameLower.endsWith(".png")) ext = "png";
      else if (fileNameLower.endsWith(".webp")) ext = "webp";
      else if (fileNameLower.endsWith(".jpg") || fileNameLower.endsWith(".jpeg")) ext = "jpg";
    }

    if (!ext && !ALLOWED_MIME.has(typeLower)) {
      return NextResponse.json(
        { error: `Unsupported image format. Please upload JPG, PNG, or WebP.` },
        { status: 400 }
      );
    }

    const finalExt = ext || "jpg";

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size exceeds 10 MB limit." },
        { status: 400 }
      );
    }

    const fileId = randomUUID();
    const savedFileName = `${fileId}.${finalExt}`;
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const filePath = join(uploadsDir, savedFileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    const secureUrl = `/uploads/${savedFileName}`;
    const publicId = `local/${actor.id}/${fileId}`;

    return NextResponse.json(
      {
        data: {
          publicId,
          secureUrl,
          public_id: publicId,
          secure_url: secureUrl,
          format: finalExt,
          bytes: file.size
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Upload API] Failed:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to process image upload" },
      { status: error?.status || 500 }
    );
  }
}
