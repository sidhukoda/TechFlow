"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

export type MapItem = {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  latitude: number;
  longitude: number;
};

function getStatusDetails(status: string) {
  switch (status) {
    case "RESOLVED":
    case "CLOSED":
      return { pin: "#10B981", bg: "#ECFDF5", text: "#065F46", label: "Resolved" };
    case "ASSIGNED":
    case "IN_PROGRESS":
      return { pin: "#1A6BFF", bg: "#EFF6FF", text: "#1E40AF", label: status.replace("_", " ") };
    default:
      return { pin: "#EF4444", bg: "#FEF2F2", text: "#991B1B", label: status.replace("_", " ") };
  }
}

function createPinIcon(status: string) {
  const { pin } = getStatusDetails(status);
  const isAlert = ["SUBMITTED", "UNDER_REVIEW", "REOPENED"].includes(status);

  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="position: relative; width: 32px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        ${isAlert ? '<span style="position: absolute; top: 0; right: 2px; width: 8px; height: 8px; background-color: #EF4444; border-radius: 9999px; box-shadow: 0 0 0 2px white; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>' : ""}
        <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(15,26,44,0.28));">
          <path d="M16 0C7.163 0 0 7.163 0 16C0 26.667 14.4 39.8 15.03 40.37C15.58 40.87 16.42 40.87 16.97 40.37C17.6 39.8 32 26.667 32 16C32 7.163 24.837 0 16 0Z" fill="${pin}"/>
          <circle cx="16" cy="15" r="6.5" fill="#FFFFFF"/>
          <circle cx="16" cy="15" r="3.2" fill="${pin}"/>
        </svg>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40]
  });
}

function MapBoundsUpdater({ items }: { items: MapItem[] }) {
  const map = useMap();

  useEffect(() => {
    if (!items.length) {
      map.setView([12.9716, 77.5946], 12);
      return;
    }

    if (items.length === 1) {
      map.setView([items[0].latitude, items[0].longitude], 14);
      return;
    }

    const bounds = L.latLngBounds(items.map(i => [i.latitude, i.longitude]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [items, map]);

  return null;
}

export function ComplaintMap({
  items,
  base,
  className
}: {
  items: MapItem[];
  base: string;
  className?: string;
}) {
  const initialCenter: [number, number] = items.length
    ? [items[0].latitude, items[0].longitude]
    : [12.9716, 77.5946];

  const initialZoom = items.length > 1 ? 12 : 14;

  const memoizedIcons = useMemo(() => {
    const cache: Record<string, L.DivIcon> = {};
    for (const item of items) {
      if (!cache[item.status]) {
        cache[item.status] = createPinIcon(item.status);
      }
    }
    return cache;
  }, [items]);

  return (
    <div className={className || "h-80 sm:h-96 w-full overflow-hidden rounded-2xl border border-[#EDF2F7] shadow-sm relative"}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        {/* Clean Google Maps Tile Layer (No API Key Required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a>'
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          maxZoom={20}
        />

        <MapBoundsUpdater items={items} />

        {items.map(item => {
          const statusMeta = getStatusDetails(item.status);
          const icon = memoizedIcons[item.status] || createPinIcon(item.status);

          return (
            <Marker
              key={item.id}
              position={[item.latitude, item.longitude]}
              icon={icon}
            >
              <Popup className="techflow-map-popup">
                <div className="p-1 min-w-[210px] max-w-xs">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                      {item.ticketNumber}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: statusMeta.bg, color: statusMeta.text }}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#0F1A2C] line-clamp-2 mb-2.5 leading-snug">
                    {item.title}
                  </h4>

                  <Link
                    href={`${base}/${item.id}`}
                    className="inline-flex items-center justify-between w-full rounded-lg bg-[#0F1A2C] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1A6BFF]"
                  >
                    <span>View report</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
