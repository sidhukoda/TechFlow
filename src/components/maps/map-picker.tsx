"use client";

import { useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { LocateFixed, MapPin } from "lucide-react";

function createPickerPinIcon() {
  return L.divIcon({
    className: "custom-picker-marker",
    html: `
      <div style="position: relative; width: 36px; height: 46px; display: flex; align-items: center; justify-content: center; cursor: grab;">
        <svg width="36" height="46" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(15,26,44,0.35));">
          <path d="M16 0C7.163 0 0 7.163 0 16C0 26.667 14.4 39.8 15.03 40.37C15.58 40.87 16.42 40.87 16.97 40.37C17.6 39.8 32 26.667 32 16C32 7.163 24.837 0 16 0Z" fill="#1A6BFF"/>
          <circle cx="16" cy="15" r="7" fill="#FFFFFF"/>
          <circle cx="16" cy="15" r="3.5" fill="#1A6BFF"/>
        </svg>
      </div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -44]
  });
}

function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: e => {
      onChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.panTo([lat, lng]);
  return null;
}

export function MapPicker({
  latitude,
  longitude,
  onChange
}: {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const [locating, setLocating] = useState(false);
  const pinIcon = useMemo(() => createPickerPinIcon(), []);

  function handleLocateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocating(false);
        onChange(pos.coords.latitude, pos.coords.longitude);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  const eventHandlers = useMemo(
    () => ({
      dragend(e: any) {
        const marker = e.target;
        const position = marker.getLatLng();
        onChange(position.lat, position.lng);
      }
    }),
    [onChange]
  );

  return (
    <div className="relative h-72 sm:h-80 w-full overflow-hidden rounded-2xl border border-[#EDF2F7] shadow-sm">
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        {/* Clean Google Maps Tile Layer (No API Key Required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a>'
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          maxZoom={20}
        />

        <MapClickHandler onChange={onChange} />
        <RecenterMap lat={latitude} lng={longitude} />

        <Marker
          position={[latitude, longitude]}
          icon={pinIcon}
          draggable={true}
          eventHandlers={eventHandlers}
        />
      </MapContainer>

      {/* Top Floating Helper Pill */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 shadow-card backdrop-blur-sm border border-slate-100 text-xs font-semibold text-[#0F1A2C]">
        <MapPin size={13} className="text-[#1A6BFF]" />
        <span>Tap map or drag pin to position</span>
      </div>

      {/* Floating GPS Button & Coordinates */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
        <div className="hidden sm:flex items-center rounded-xl bg-white/90 px-2.5 py-1 text-[10px] font-mono font-semibold text-slate-600 shadow-sm backdrop-blur-sm border border-slate-100">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </div>
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#1A6BFF] shadow-card border border-slate-100 transition hover:bg-blue-50 disabled:opacity-50"
          title="Use my current GPS location"
        >
          <LocateFixed size={14} className={locating ? "animate-spin" : ""} />
          <span>{locating ? "Locating..." : "My GPS"}</span>
        </button>
      </div>
    </div>
  );
}
