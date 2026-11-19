"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  ChartNoAxesCombined,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPin,
  Plus,
  Settings,
  Shield,
  Users,
  Wrench,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles
} from "lucide-react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Role = "citizen" | "admin" | "worker";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  section?: "General" | "Tools" | "Operations";
  badge?: number;
}

const menuSections: Record<Role, { general: MenuItem[]; tools: MenuItem[] }> = {
  citizen: {
    general: [
      { href: "/citizen/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/citizen/complaints", label: "My Reports", icon: ClipboardList }
    ],
    tools: [
      { href: "/citizen/new-complaint", label: "Report Issue", icon: Plus },
      { href: "/citizen/notifications", label: "Notifications", icon: Bell },
      { href: "/citizen/profile", label: "Settings & Profile", icon: Settings }
    ]
  },
  admin: {
    general: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/complaints", label: "Complaints", icon: ClipboardList },
      { href: "/admin/map", label: "Issue Map", icon: MapPin },
      { href: "/admin/departments", label: "Departments", icon: Shield },
      { href: "/admin/workers", label: "Field Workers", icon: Wrench },
      { href: "/admin/users", label: "Users", icon: Users }
    ],
    tools: [
      { href: "/admin/analytics", label: "Statistics", icon: ChartNoAxesCombined },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList },
      { href: "/admin/settings", label: "SLA Settings", icon: Settings },
      { href: "/admin/notifications", label: "Notifications", icon: Bell },
      { href: "/admin/profile", label: "Profile", icon: Users }
    ]
  },
  worker: {
    general: [
      { href: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/worker/tasks", label: "Assigned Tasks", icon: ClipboardList }
    ],
    tools: [
      { href: "/worker/notifications", label: "Notifications", icon: Bell },
      { href: "/worker/profile", label: "Profile", icon: Users }
    ]
  }
};

const roleLabels: Record<Role, string> = {
  citizen: "Citizen Portal",
  admin: "Super Admin",
  worker: "Field Operations"
};

interface MobileTab {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isFab?: boolean;
}

const mobileTabsConfig: Record<Role, MobileTab[]> = {
  citizen: [
    { href: "/citizen/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/citizen/complaints", label: "Reports", icon: ClipboardList },
    { href: "/citizen/new-complaint", label: "Report", icon: Plus, isFab: true },
    { href: "/track", label: "Track", icon: Search },
    { href: "/citizen/profile", label: "Profile", icon: Settings }
  ],
  admin: [
    { href: "/admin/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/admin/complaints", label: "Tickets", icon: ClipboardList },
    { href: "/admin/map", label: "Map", icon: MapPin },
    { href: "/admin/analytics", label: "Analytics", icon: ChartNoAxesCombined },
    { href: "/admin/departments", label: "Depts", icon: Shield }
  ],
  worker: [
    { href: "/worker/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/worker/tasks", label: "Tasks", icon: ClipboardList },
    { href: "/worker/notifications", label: "Alerts", icon: Bell },
    { href: "/worker/profile", label: "Profile", icon: Settings }
  ]
};

export function AppShell({
  role,
  name,
  superAdmin = false,
  children
}: {
  role: Role;
  name: string;
  superAdmin?: boolean;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();

  const sections = menuSections[role];
  const filterAdminItems = (items: MenuItem[]) =>
    items.filter(item => superAdmin || !["/admin/departments", "/admin/users", "/admin/audit-logs", "/admin/settings"].includes(item.href));

  const generalItems = role === "admin" ? filterAdminItems(sections.general) : sections.general;
  const toolItems = role === "admin" ? filterAdminItems(sections.tools) : sections.tools;

  const notificationsHref = `/${role}/notifications`;
  const profileHref = `/${role}/profile`;
  const displayName = name.replace(/^Demo\s+/i, "").trim() || "User";
  const initials = displayName.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "TF";

  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchUnread() {
      try {
        const res = await fetch("/api/notifications?page=1", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data?.unread === "number") {
            setUnreadCount(data.unread);
          }
        }
      } catch {
        // network or auth offline
      }
    }

    void fetchUnread();
    const interval = setInterval(fetchUnread, 20000);

    const handleUpdate = (e?: Event) => {
      const custom = e as CustomEvent<{ unread?: number }>;
      if (typeof custom?.detail?.unread === "number") {
        setUnreadCount(custom.detail.unread);
      } else {
        void fetchUnread();
      }
    };

    window.addEventListener("notifications-changed", handleUpdate);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("notifications-changed", handleUpdate);
    };
  }, [path]);

  async function logout() {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#F3F6FA] md:flex">
      {/* PC / DESKTOP SIDEBAR (Visible only on md+ screens, sticky navigation) */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 bg-[#F3F6FA] border-r border-[#E7ECF3] flex-col justify-between p-5 md:sticky md:top-0 md:h-screen">
        <div>
          {/* Header Brand */}
          <div className="flex items-center justify-between pb-6">
            <Brand href={`/${role}/dashboard`} />
            <span className="hidden sm:inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
              {role}
            </span>
          </div>

          {/* Section: General */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">General</p>
            {generalItems.map(item => {
              const active = path === item.href || (item.href !== `/${role}/dashboard` && path.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all",
                    active
                      ? "bg-white text-[#0F1A2C] shadow-card font-bold"
                      : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={19} className={active ? "text-blue-600" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Section: Tools */}
          <div className="mt-6 space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Tools</p>
            {toolItems.map(item => {
              const active = path === item.href || path.startsWith(`${item.href}/`);
              const badge = item.label === "Notifications" ? (unreadCount > 0 ? unreadCount : undefined) : item.badge;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all",
                    active
                      ? "bg-white text-[#0F1A2C] shadow-card font-bold"
                      : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={19} className={active ? "text-blue-600" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                  {badge !== undefined && (
                    <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Sidebar Logout Action */}
            <div className="pt-2 border-t border-slate-200/60 mt-3">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all text-left cursor-pointer group"
              >
                <LogOut size={19} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Promo Card with Dark Contrast Action Button */}
        <div className="pt-6">
          <div className="rounded-2xl border border-blue-100/80 bg-[#EEF4FE] p-4 text-[#0F1A2C]">
            <h4 className="font-heading font-bold text-sm text-[#0F1A2C]">Report online.</h4>
            <p className="mt-0.5 text-xs text-slate-500 leading-snug">
              Fast resolution. Transparent tracking.
            </p>

            <Link
              href={role === "citizen" ? "/citizen/new-complaint" : "/report"}
              className="mt-3.5 flex items-center justify-center gap-2 rounded-xl bg-[#0A1120] py-2.5 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#162238]"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-xs">+</span>
              <span>New Report</span>
            </Link>
          </div>

          <div className="mt-3 flex items-center justify-between px-2 text-[10px] text-slate-400">
            <a
              href="https://techbyhit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 hover:underline transition font-medium"
              title="Developed by TechbyHIT - Visit techbyhit.com"
            >
              Developed by TechbyHIT
            </a>
            <button onClick={logout} className="hover:text-red-600 font-semibold flex items-center gap-1 cursor-pointer">
              <LogOut size={11} /> Log out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE (PC & MOBILE APP MODES) */}
      <div className="min-w-0 flex-1 flex flex-col">
        {/* MOBILE TOP APP BAR (Native App Chrome) */}
        <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EDF2F7] px-4 py-3 flex items-center justify-between">
          <Brand href={`/${role}/dashboard`} />
          <div className="flex items-center gap-2">
            <Link
              href={notificationsHref}
              aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-600 active:scale-95 transition"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <Link
              href={profileHref}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm shrink-0 active:scale-95 transition"
              title={displayName}
            >
              {initials}
            </Link>

            <button
              type="button"
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 active:scale-95 transition cursor-pointer"
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        {/* PC / DESKTOP FLOATING TOPBAR */}
        <header className="hidden md:flex px-5 py-4 md:px-8 items-center justify-between gap-4">
          {/* Pill Search Input */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports, tickets, departments..."
              style={{ paddingLeft: "2.75rem" }}
              className="w-full rounded-full border border-slate-200/80 bg-white py-2 pl-11 pr-4 text-xs text-slate-800 shadow-card placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-3 ml-auto">
            <Link
              href={notificationsHref}
              aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E7ECF3] shadow-card text-slate-600 transition hover:bg-slate-50"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <Link
              href={profileHref}
              className="flex items-center gap-2.5 rounded-full bg-white border border-[#E7ECF3] py-1.5 pl-2 pr-3.5 shadow-card transition hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm shrink-0">
                {initials}
              </div>
              <div className="hidden lg:flex flex-col justify-center text-left leading-none gap-1">
                <span className="text-xs font-bold text-[#0F1A2C] leading-tight truncate max-w-[140px] block">{displayName}</span>
                <span className="text-[10px] font-medium text-slate-400 leading-tight block">{roleLabels[role]}</span>
              </div>
            </Link>

            {/* Universal Prominent Logout Button */}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-full bg-white border border-[#E7ECF3] py-2 px-3.5 text-xs font-bold text-slate-600 shadow-card transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
              title="Sign out of TechFlow"
            >
              <LogOut size={15} className="text-slate-400 group-hover:text-red-600" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        {/* Content Body with Safe Bottom Padding for Mobile Tabs */}
        <main className="flex-1 px-4 py-4 md:px-8 md:py-6 pb-28 md:pb-8">
          {children}
        </main>

        {/* MOBILE NATIVE APP BOTTOM TAB BAR */}
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex items-center justify-around max-w-md mx-auto">
            {mobileTabsConfig[role].map(tab => {
              const active = path === tab.href || (tab.href !== `/${role}/dashboard` && path.startsWith(`${tab.href}/`));

              if (tab.isFab) {
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className="relative -top-5 flex flex-col items-center group"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A6BFF] text-white shadow-lg shadow-blue-500/35 transition-transform active:scale-95 group-hover:scale-105">
                      <tab.icon size={22} className="stroke-[2.5]" />
                    </div>
                    <span className="mt-1 text-[10px] font-bold text-blue-600 tracking-tight">
                      {tab.label}
                    </span>
                  </Link>
                );
              }

              const isAlertsTab = tab.icon === Bell || tab.label === "Alerts";
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-95",
                    active ? "text-[#1A6BFF]" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <div className="relative">
                    <tab.icon size={20} className={active ? "text-[#1A6BFF]" : "text-slate-400"} />
                    {isAlertsTab && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-white" />
                    )}
                  </div>
                  <span className={cn("mt-1 text-[10px] font-semibold tracking-tight", active && "font-bold text-[#1A6BFF]")}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
