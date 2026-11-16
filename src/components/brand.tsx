import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function TechFlowIcon({
  size = 36,
  light = false,
  className
}: {
  size?: number;
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center transition-transform hover:scale-105",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/images/techflow-icon.png"
        alt="TechFlow Logo Icon"
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-contain drop-shadow-sm"
        priority
      />
    </div>
  );
}

export function Brand({
  href = "/",
  light = false,
  className
}: {
  href?: string;
  light?: boolean;
  compact?: boolean;
  showCredit?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex shrink-0 items-center gap-3 select-none", className)}>
      <Link href={href} aria-label="TechFlow home" className="inline-flex items-center gap-3 group">
        <TechFlowIcon size={38} light={light} />
        <span
          className={cn(
            "font-heading text-[1.35rem] font-extrabold tracking-tight leading-none",
            light ? "text-white" : "text-[#0B1B3D]"
          )}
        >
          Tech<span className="text-[#FF9200]">Flow</span>
        </span>
      </Link>
    </div>
  );
}

export function OfficialLogoBadge({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      <Image
        src="/images/techflow-official-logo.jpg"
        alt="TechFlow Smart Public Infrastructure Issue Reporting and Resolution Platform - Developed by TechbyHIT"
        width={512}
        height={218}
        className="w-full max-w-md h-auto object-contain rounded-xl shadow-sm"
      />
      <a
        href="https://techbyhit.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#0B1B3D] hover:bg-[#152B5B] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition"
      >
        <span className="font-mono text-[#00C2FF]">&lt;/&gt;</span>
        <span>Developed by TechbyHIT</span>
      </a>
    </div>
  );
}
