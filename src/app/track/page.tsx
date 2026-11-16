import { SearchCheck } from "lucide-react";
import { SiteHeaderV2 } from "@/components/layout/site-header-v2";
import { TrackForm } from "@/components/track/track-form";
import { Brand } from "@/components/brand";

export default function Track() {
  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col justify-between">
      <SiteHeaderV2 />

      <main className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14 w-full">
        <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 sm:p-10 shadow-card">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#EEF4FE] px-3 py-1 text-xs font-bold text-blue-700">
            <SearchCheck size={14} />
            <span>Public Incident Tracker</span>
          </div>

          <h1 className="mt-4 font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#0F1A2C]">
            Follow your report, step by step.
          </h1>

          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 max-w-xl">
            Enter the ticket number from your submission receipt or confirmation message to inspect real-time progress, assigned municipal crew, and resolution evidence.
          </p>

          <div className="mt-8">
            <TrackForm />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Ticket numbers start with <span className="font-mono font-bold text-blue-600">TF-</span> followed by the year and ticket sequence.
          </div>
        </div>
      </main>

      <footer className="border-t border-[#EDF2F7] bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 sm:flex-row md:px-8 text-xs text-slate-400">
          <Brand />
          <div>
            <a
              href="https://techbyhit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-blue-600 hover:underline font-semibold"
            >
              Developed by TechbyHIT
            </a>{" "}
            &bull; Smart Public Infrastructure Platform
          </div>
        </div>
      </footer>
    </div>
  );
}
