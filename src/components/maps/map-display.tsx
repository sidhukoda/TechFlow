"use client";

import dynamic from "next/dynamic";
import type { MapItem } from "@/components/maps/complaint-map";

const Map = dynamic(
  () => import("@/components/maps/complaint-map").then(m => m.ComplaintMap),
  {
    ssr: false,
    loading: () => <div className="h-80 sm:h-96 w-full animate-pulse rounded-2xl bg-slate-100" />
  }
);

export function MapDisplay({
  items,
  base,
  className
}: {
  items: MapItem[];
  base: string;
  className?: string;
}) {
  return <Map items={items} base={base} className={className} />;
}
