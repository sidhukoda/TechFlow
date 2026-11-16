import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TechFlow Smart Public Infrastructure",
    short_name: "TechFlow",
    description: "Smart Public Infrastructure Issue Reporting and Resolution Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#F3F6FA",
    theme_color: "#0B1B3D",
    orientation: "portrait",
    icons: [
      {
        src: "/images/techflow-icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/images/techflow-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
