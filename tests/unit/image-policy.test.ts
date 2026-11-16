import { describe, expect, it } from "vitest";
import { validImageAsset } from "@/lib/image-policy";
const url = "https://res.cloudinary.com/example/image/upload/example.jpg";
describe("server image policy", () => {
  it("accepts a matching supported image under 5 MB", () => expect(validImageAsset({ secure_url: url, resource_type: "image", bytes: 1000, format: "jpg" }, url)).toBe(true));
  it("rejects oversized and unsupported files", () => { expect(validImageAsset({ secure_url: url, resource_type: "image", bytes: 5_000_001, format: "jpg" }, url)).toBe(false); expect(validImageAsset({ secure_url: url, resource_type: "image", bytes: 1000, format: "svg" }, url)).toBe(false); });
  it("rejects a mismatched URL", () => expect(validImageAsset({ secure_url: url, resource_type: "image", bytes: 1000, format: "png" }, "https://other.example/image.png")).toBe(false));
});
