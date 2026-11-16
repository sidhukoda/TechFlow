"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Brand } from "@/components/brand";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/report", label: "Report Issue" },
  { href: "/track", label: "Track Issue" },
  { href: "/#departments", label: "Departments" },
  { href: "/about", label: "About" }
];

export function SiteHeaderV2() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-40">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
        {/* Brand Logo matching official design */}
        <Brand />

        {/* Navigation links matching Image 1 */}
        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-semibold text-slate-700 lg:flex">
          {navLinks.map(link => {
            const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "relative pb-1 font-bold text-[#0F1A2C] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#FF8A00] after:rounded-full"
                    : "text-slate-600 hover:text-[#0F1A2C] transition-colors"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons matching Image 1 */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            className="rounded-full border border-slate-200/90 bg-white px-5 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#1A6BFF] hover:bg-[#1559D6] px-5 py-2 text-xs font-bold text-white shadow-sm transition"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Navigation Drawer */}
        <details className="group relative sm:hidden">
          <summary aria-label="Open navigation" className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 text-[#0F1A2C] hover:bg-slate-50">
            <Menu size={20} />
          </summary>
          <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-slate-200 bg-white p-3 shadow-card">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <Link
                className="rounded-xl border border-slate-200 px-3 py-2 text-center text-xs font-bold text-slate-800 hover:bg-slate-50"
                href="/login"
              >
                Sign In
              </Link>
              <Link
                className="rounded-xl bg-[#1A6BFF] px-3 py-2 text-center text-xs font-bold text-white hover:bg-[#1559D6]"
                href="/register"
              >
                Get Started
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
