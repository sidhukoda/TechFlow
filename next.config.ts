import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "@radix-ui/react-slot"]
  }
};

export default nextConfig;
