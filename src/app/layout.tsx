import type { Metadata, Viewport } from "next";
import { DM_Sans, Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap"
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0B1B3D"
};

export const metadata: Metadata = {
  title: { default: "TechFlow | Report It. Track It. Fix It.", template: "%s | TechFlow" },
  description: "A smarter way to report and resolve public infrastructure issues.",
  icons: { icon: "/images/techflow-logo.png", apple: "/images/techflow-logo.png" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TechFlow"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased font-body">{children}</body>
    </html>
  );
}
