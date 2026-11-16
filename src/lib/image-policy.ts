export function validImageAsset(asset: { secure_url: string; resource_type: string; bytes: number; format: string }, secureUrl: string) {
  return asset.secure_url === secureUrl && asset.resource_type === "image" && asset.bytes > 0 && asset.bytes <= 5_000_000 && ["jpg", "jpeg", "png", "webp"].includes(asset.format.toLowerCase());
}
