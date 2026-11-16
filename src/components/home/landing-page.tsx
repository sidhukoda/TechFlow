import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  FileEdit,
  MapPin,
  CheckSquare,
  Wrench,
  Droplets,
  Trash2,
  Lightbulb,
  Building2,
  Landmark,
  ArrowRight,
  PhoneCall,
  Mail,
  Clock,
  ShieldCheck,
  Headphones
} from "lucide-react";
import { Brand } from "@/components/brand";
import { SiteHeaderV2 } from "@/components/layout/site-header-v2";

const featurePillars = [
  {
    title: "Report",
    icon: FileEdit,
    iconColor: "text-[#1A6BFF]",
    iconBg: "bg-[#EEF4FE]",
    description: "Share the issue with a photo and location."
  },
  {
    title: "Track",
    icon: MapPin,
    iconColor: "text-[#FF8A00]",
    iconBg: "bg-[#FFF4E6]",
    description: "Check the real-time status of your report."
  },
  {
    title: "Resolve",
    icon: CheckSquare,
    iconColor: "text-[#16A34A]",
    iconBg: "bg-[#EDFAF1]",
    description: "Get the issue fixed by the concerned department."
  }
];

const infrastructureCategories = [
  {
    title: "Damaged Roads & Potholes",
    dept: "Roads Department",
    icon: Wrench,
    description: "Potholes, broken asphalt, damaged speed breakers, road cave-ins."
  },
  {
    title: "Water Leaks & Supply",
    dept: "Water Supply Department",
    icon: Droplets,
    description: "Burst pipelines, continuous road leakages, low water pressure."
  },
  {
    title: "Garbage & Sanitation",
    dept: "Sanitation Department",
    icon: Trash2,
    description: "Overflowing public dumpsters, uncleared waste, street cleaning."
  },
  {
    title: "Broken Streetlights",
    dept: "Electrical Department",
    icon: Lightbulb,
    description: "Non-functioning streetlamps, dark corridors, exposed wires."
  },
  {
    title: "Public Infrastructure",
    dept: "Public Works Department",
    icon: Building2,
    description: "Damaged sidewalks, broken footpaths, hazardous guardrails."
  }
];

const contactChannels = [
  {
    title: "24/7 Civic Helpline",
    icon: PhoneCall,
    iconColor: "text-[#FF8A00]",
    iconBg: "bg-[#FFF4E6]",
    primary: "1800-123-FLOW (3569)",
    secondary: "Emergency Civic Dispatch: 112",
    description: "Dedicated toll-free helpline for urgent road hazards, open sinkholes, live wire emergencies, or water main bursts.",
    actionLabel: "Call Helpline",
    actionHref: "tel:18001233569"
  },
  {
    title: "Citizen Support Helpdesk",
    icon: Mail,
    iconColor: "text-[#1A6BFF]",
    iconBg: "bg-[#EEF4FE]",
    primary: "support@techflow.org",
    secondary: "helpdesk@techflow.gov.in",
    description: "Submit inquiries regarding ticket progression, photographic resolution proof, or municipal jurisdiction questions.",
    actionLabel: "Email Support",
    actionHref: "mailto:support@techflow.org"
  },
  {
    title: "Municipal Control Center",
    icon: MapPin,
    iconColor: "text-[#16A34A]",
    iconBg: "bg-[#EDFAF1]",
    primary: "Central Operations Command",
    secondary: "Municipal Complex, Ward 4, Bengaluru",
    description: "Coordinating field crews and automated dispatch across 5 municipal departments and all municipal zones.",
    actionLabel: "View Departments",
    actionHref: "#departments"
  }
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col justify-between">
      {/* HEADER WITH MATCHING LOGO & NAVIGATION */}
      <SiteHeaderV2 />

      <main className="space-y-12 pb-16">
        {/* HERO SECTION - PERFECT IMAGE FITTING & SIZING */}
        <section className="mx-auto max-w-7xl px-5 pt-6 md:px-8 md:pt-8">
          <div className="rounded-3xl border border-[#EDF2F7] bg-white p-6 sm:p-10 lg:p-12 shadow-card">
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Left Column: Headline & Action Buttons */}
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-[#EEF4FE] px-3.5 py-1.5 text-xs font-bold text-[#1A6BFF]">
                  <Landmark size={14} className="text-[#1A6BFF]" />
                  <span>Smart Public Infrastructure Platform</span>
                </span>

                <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#0F1A2C] sm:text-4xl lg:text-5xl leading-[1.15]">
                  Report infrastructure problems{" "}
                  <span className="text-[#FF8A00]">in your area.</span>
                </h1>

                <p className="text-sm sm:text-base leading-relaxed text-slate-500 max-w-xl">
                  Report damaged roads, water leaks, broken streetlights, and other public
                  infrastructure issues. Track what happens after you submit a report.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <Link
                    href="/report"
                    className="flex items-center gap-2 rounded-xl bg-[#1A6BFF] hover:bg-[#1559D6] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
                  >
                    <Plus size={18} />
                    <span>Report an Issue</span>
                  </Link>

                  <Link
                    href="/track"
                    className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-card transition"
                  >
                    <Search size={16} className="text-[#1A6BFF]" />
                    <span>Track an Issue</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Clean, Perfectly Fitted Hero Illustration */}
              <div className="flex items-center justify-center relative w-full">
                <div className="relative w-full max-w-[480px] lg:max-w-[540px]">
                  <Image
                    src="/images/hero-illustration.png"
                    alt="Smart City Infrastructure Issue Reporting"
                    width={520}
                    height={306}
                    className="w-full h-auto object-contain select-none transition-transform hover:scale-[1.01] duration-300"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* 3-PILLAR FEATURE RIBBON: Report • Track • Resolve */}
            <div className="mt-12 pt-8 border-t border-[#EDF2F7] grid gap-6 sm:grid-cols-3">
              {featurePillars.map(pillar => (
                <div
                  key={pillar.title}
                  className="flex items-start gap-4 p-3 rounded-2xl transition hover:bg-[#F8FAFD]"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${pillar.iconBg} ${pillar.iconColor} shadow-sm`}
                  >
                    <pillar.icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#0F1A2C]">
                      {pillar.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-snug">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ISSUE CATEGORIES SECTION */}
        <section id="departments" className="mx-auto max-w-7xl px-5 md:px-8 pt-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#FF8A00]">
                Departments & Categories
              </p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-[#0F1A2C] sm:text-3xl">
                Public infrastructure managed by TechFlow
              </h2>
            </div>
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A6BFF] hover:underline"
            >
              <span>File a New Report</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {infrastructureCategories.map(cat => (
              <div
                key={cat.title}
                className="group rounded-2xl border border-[#EDF2F7] bg-white p-5 shadow-card transition-all hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-[#1A6BFF] group-hover:bg-[#EEF4FE] transition">
                    <cat.icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-[#0F1A2C] group-hover:text-[#1A6BFF] transition">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400">{cat.dept}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT & CITIZEN HELPDESK SECTION */}
        <section id="contact" className="mx-auto max-w-7xl px-5 md:px-8 pt-4">
          <div className="rounded-3xl border border-[#EDF2F7] bg-white p-6 sm:p-10 shadow-card">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end mb-8">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-[#FFF4E6] px-3.5 py-1.5 text-xs font-bold text-[#FF8A00]">
                  <Headphones size={14} />
                  <span>24/7 Citizen Support & Emergency Hotline</span>
                </span>
                <h2 className="mt-3 font-heading text-2xl font-bold text-[#0F1A2C] sm:text-3xl">
                  Contact TechFlow Support
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
                  Have an urgent infrastructure emergency, questions regarding ticket progression, or need assistance with reporting? Our civic dispatch teams are on standby 24 hours a day.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-600">All Systems Operational</span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {contactChannels.map(channel => (
                <div
                  key={channel.title}
                  className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-[#F8FAFD] p-6 transition hover:bg-white hover:shadow-card hover:border-blue-200"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${channel.iconBg} ${channel.iconColor} shadow-sm`}
                      >
                        <channel.icon size={22} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Official Channel
                      </span>
                    </div>

                    <h3 className="font-heading text-base font-bold text-[#0F1A2C]">
                      {channel.title}
                    </h3>

                    <p className="mt-2 font-mono text-xs font-bold text-[#1A6BFF]">
                      {channel.primary}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      {channel.secondary}
                    </p>

                    <p className="mt-3 text-xs leading-relaxed text-slate-500">
                      {channel.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60">
                    <a
                      href={channel.actionHref}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#1A6BFF] hover:text-[#1559D6] transition"
                    >
                      <span>{channel.actionLabel}</span>
                      <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* RICH MUNICIPAL FOOTER */}
      <footer className="border-t border-[#EDF2F7] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 pb-10 border-b border-[#EDF2F7]">
            {/* Col 1: Brand & Summary */}
            <div className="space-y-4">
              <Brand />
              <p className="text-xs leading-relaxed text-slate-500">
                A modern smart city platform connecting residents directly with public works teams for real-time reporting, transparent tracking, and verified resolution of civic infrastructure.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck size={14} />
                  <span>Citizen Resolution Guarantee</span>
                </span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#0F1A2C] mb-4">
                Platform Navigation
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-500">
                <li>
                  <Link href="/" className="hover:text-[#1A6BFF] transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/report" className="hover:text-[#1A6BFF] transition">
                    Report an Issue
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="hover:text-[#1A6BFF] transition">
                    Track Report Status
                  </Link>
                </li>
                <li>
                  <Link href="/#departments" className="hover:text-[#1A6BFF] transition">
                    Municipal Departments
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="hover:text-[#1A6BFF] transition">
                    24/7 Citizen Contact
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#1A6BFF] transition">
                    About TechFlow
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Civic Departments */}
            <div>
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#0F1A2C] mb-4">
                Civic Jurisdictions
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <Wrench size={13} className="text-slate-400" />
                  <span>Roads & Highways Department</span>
                </li>
                <li className="flex items-center gap-2">
                  <Droplets size={13} className="text-slate-400" />
                  <span>Water Supply & Pipeline Works</span>
                </li>
                <li className="flex items-center gap-2">
                  <Trash2 size={13} className="text-slate-400" />
                  <span>Sanitation & Waste Disposal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lightbulb size={13} className="text-slate-400" />
                  <span>Electrical & Public Lighting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Building2 size={13} className="text-slate-400" />
                  <span>Public Works & Infrastructure</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Quick Contact */}
            <div>
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#0F1A2C] mb-4">
                Emergency & Helpdesk
              </h4>
              <div className="space-y-3 text-xs text-slate-600">
                <div>
                  <p className="font-bold text-[#0F1A2C]">Toll-Free Civic Helpline</p>
                  <p className="font-mono text-sm font-bold text-[#1A6BFF] mt-0.5">1800-123-FLOW</p>
                </div>
                <div>
                  <p className="font-bold text-[#0F1A2C]">Emergency Police / Fire / Hazard</p>
                  <p className="font-mono text-sm font-bold text-[#FF8A00] mt-0.5">112</p>
                </div>
                <div>
                  <p className="font-bold text-[#0F1A2C]">Support Email</p>
                  <p className="font-mono text-xs text-slate-500 mt-0.5">support@techflow.org</p>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM BAR WITH TECHBYHIT CLICKABLE LINK (NO .COM IN TEXT) */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} TechFlow. Smart Public Infrastructure Platform. All rights reserved.
            </p>

            {/* Official Clickable Badge linking to techbyhit.com with text: Developed by TechbyHIT */}
            <a
              href="https://techbyhit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#0B1B3D] hover:bg-[#152B5B] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition group"
              title="Developed by TechbyHIT - Open techbyhit.com"
            >
              <span className="font-mono text-[#00C2FF]">&lt;/&gt;</span>
              <span className="group-hover:text-blue-300 transition">Developed by TechbyHIT</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
