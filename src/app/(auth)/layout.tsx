import Image from "next/image";
import { MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Brand } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col justify-between">
      {/* Sleek Top Header with proper spacing and single attribution */}
      <header className="border-b border-[#EDF2F7] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 md:px-8">
          <Brand />
          <a
            href="https://techbyhit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#0B1B3D] hover:bg-[#152B5B] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition shrink-0 group"
            title="Developed by TechbyHIT - Visit techbyhit.com"
          >
            <span className="font-mono text-[#00C2FF] text-[10px]">&lt;/&gt;</span>
            <span className="group-hover:text-blue-300 transition whitespace-nowrap">Developed by TechbyHIT</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto flex-1 grid w-full max-w-7xl items-center gap-10 px-5 py-8 md:px-8 lg:grid-cols-[1.1fr_440px]">
        {/* Left Side: Clean Visual Product Feature Showcase */}
        <section className="hidden min-h-[560px] flex-col justify-between rounded-3xl border border-[#EDF2F7] bg-white p-8 shadow-card lg:flex">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#EEF4FE] px-3 py-1 text-xs font-bold text-blue-700">
              <CheckCircle2 size={13} />
              <span>Civic Infrastructure Platform</span>
            </span>

            <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-[#0F1A2C]">
              Better public spaces start with verified action.
            </h2>

            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500">
              Connect municipal infrastructure problems directly with the field departments that resolve them. Track every step with on-site photographs and real-time status progression.
            </p>
          </div>

          <div className="my-6 flex items-center justify-center">
            <Image
              src="/images/hero-illustration.png"
              alt="Civic Infrastructure Issue Resolution"
              width={480}
              height={300}
              className="w-full max-w-sm h-auto object-contain"
              priority
            />
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <MapPin size={16} className="text-blue-600 shrink-0" />
              <span>Location-accurate GPS tracking</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>Photo-verified resolution</span>
            </div>
          </div>
        </section>

        {/* Right Side: Form Container */}
        <div className="w-full py-4">
          {children}
        </div>
      </main>

      {/* Clean Municipal Footer */}
      <footer className="border-t border-[#EDF2F7] bg-white py-5 px-5 mt-auto">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} TechFlow &bull; Smart Public Infrastructure Platform. All rights reserved.
          </p>
          <a
            href="https://techbyhit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0B1B3D] hover:bg-[#152B5B] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition group shrink-0"
            title="Developed by TechbyHIT - Visit techbyhit.com"
          >
            <span className="font-mono text-[#00C2FF] text-[10px]">&lt;/&gt;</span>
            <span className="group-hover:text-blue-300 transition whitespace-nowrap">Developed by TechbyHIT</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
