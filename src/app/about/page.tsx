import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, ClipboardCheck, MapPinned, ShieldCheck } from "lucide-react";
import { SiteHeaderV2 } from "@/components/layout/site-header-v2";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";

export const revalidate = 3600;

const steps = [
  {
    icon: Camera,
    title: "1. Report the issue",
    text: "Submit the issue title, detailed description, photograph, and pinpoint the exact map location."
  },
  {
    icon: ClipboardCheck,
    title: "2. Department action",
    text: "The assigned public works or municipal team reviews the report and dispatches field operators."
  },
  {
    icon: BadgeCheck,
    title: "3. Verify resolution",
    text: "Review on-site photographic evidence before approving and closing the complaint."
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col justify-between">
      <SiteHeaderV2 />

      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14 w-full space-y-12">
        <section className="rounded-2xl border border-[#EDF2F7] bg-white p-6 sm:p-10 lg:p-12 shadow-card">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#EEF4FE] px-3 py-1 text-xs font-bold text-blue-700">
            <MapPinned size={14} />
            <span>About TechFlow</span>
          </span>

          <h1 className="mt-5 max-w-3xl font-heading text-3xl font-bold tracking-tight text-[#0F1A2C] sm:text-4xl">
            Public issues deserve a visible path to resolution.
          </h1>

          <p className="mt-4 max-w-2xl text-xs sm:text-base leading-relaxed text-slate-500">
            TechFlow connects community reports with the departments and field teams responsible for public infrastructure. Every report has a verified ticket number, recorded status timeline, and citizen resolution review.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl bg-[#1A6BFF] text-white hover:bg-[#1559D6] shadow-sm font-semibold">
              <Link href="/report" className="flex items-center gap-2">
                <span>Report an Issue</span>
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl border-[#EDF2F7] bg-white text-slate-700 hover:bg-slate-50 shadow-card font-semibold">
              <Link href="/track">Track a Report</Link>
            </Button>
          </div>
        </section>

        <section>
          <div className="max-w-2xl mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">From First Report to Final Fix</p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-[#0F1A2C] sm:text-3xl">
              A transparent process for citizens and municipal teams.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map(step => (
              <div key={step.title} className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card transition-all hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <step.icon size={19} />
                </div>
                <h3 className="mt-4 font-heading text-base font-bold text-[#0F1A2C]">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{step.text}</p>
              </div>
            ))}
          </div>
        </section>
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
            &bull; TechFlow Public Civic Systems
          </div>
        </div>
      </footer>
    </div>
  );
}
