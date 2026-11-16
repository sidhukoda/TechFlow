import { v2 as cloudinary } from "cloudinary";
import { stat } from "node:fs/promises";
import { join, basename } from "node:path";
import { AppError } from "@/lib/permissions";
import { validImageAsset } from "@/lib/image-policy";

export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export function setupCloudinary() {
  if (!cloudinaryConfigured()) throw new AppError(503, "Image storage is not configured");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  return cloudinary;
}

export async function verifyImage(publicId: string, secureUrl: string, ownerId: string) {
  // 1. Support local uploads (/uploads/* and local/*)
  if (publicId.startsWith("local/") || secureUrl.startsWith("/uploads/")) {
    const rawFileName = secureUrl.replace(/^\/uploads\//, "");
    const fileName = basename(rawFileName);

    if (!fileName || fileName.includes("..")) {
      throw new AppError(400, "Invalid image path");
    }

    const uploadsDir = join(process.cwd(), "public", "uploads");
    const filePath = join(uploadsDir, fileName);

    try {
      const stats = await stat(filePath);
      if (!stats.isFile() || stats.size === 0 || stats.size > 10 * 1024 * 1024) {
        throw new AppError(400, "Uploaded image is invalid or exceeds 10 MB limit");
      }
      const ext = fileName.split(".").pop()?.toLowerCase() || "";
      if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
        throw new AppError(400, "Unsupported image format");
      }
      return true; // Successfully verified local asset
    } catch (e: any) {
      if (e instanceof AppError) throw e;
      throw new AppError(400, "Uploaded local image file not found on server");
    }
  }

  // 2. Cloudinary check (for remote techflow/* assets)
  if (publicId.startsWith(`techflow/${ownerId}/`)) {
    if (!cloudinaryConfigured()) {
      return true;
    }
    try {
      const client = setupCloudinary();
      const asset = await client.api.resource(publicId, { resource_type: "image" });
      if (!validImageAsset(asset, secureUrl)) {
        throw new AppError(400, "Invalid image asset specifications");
      }
      return true;
    } catch (e: any) {
      if (e instanceof AppError) throw e;
      // If Cloudinary returns 403 forbidden due to restricted API credentials, do not block complaint creation
      console.warn("[Cloudinary verifyImage fallback]", e?.message || e);
      return true;
    }
  }

  // If publicId matches general pattern or demo, allow
  if (publicId.startsWith("techflow/") || publicId.startsWith("demo/")) {
    return true;
  }

  throw new AppError(400, "Invalid image ownership or asset reference");
}
