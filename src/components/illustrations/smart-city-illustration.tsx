export function SmartCityIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Smart public infrastructure illustration with city buildings, road repair, streetlight, and mobile report"
    >
      {/* Background City Skyline Shapes */}
      <rect x="60" y="160" width="70" height="240" rx="4" fill="#E2E8F0" />
      <rect x="75" y="180" width="16" height="22" rx="2" fill="#CBD5E1" />
      <rect x="100" y="180" width="16" height="22" rx="2" fill="#CBD5E1" />
      <rect x="75" y="220" width="16" height="22" rx="2" fill="#CBD5E1" />
      <rect x="100" y="220" width="16" height="22" rx="2" fill="#CBD5E1" />
      <rect x="75" y="260" width="16" height="22" rx="2" fill="#CBD5E1" />
      <rect x="100" y="260" width="16" height="22" rx="2" fill="#CBD5E1" />

      <rect x="145" y="110" width="90" height="290" rx="4" fill="#CBD5E1" />
      <rect x="165" y="130" width="20" height="24" rx="2" fill="#94A3B8" />
      <rect x="195" y="130" width="20" height="24" rx="2" fill="#94A3B8" />
      <rect x="165" y="170" width="20" height="24" rx="2" fill="#94A3B8" />
      <rect x="195" y="170" width="20" height="24" rx="2" fill="#94A3B8" />
      <rect x="165" y="210" width="20" height="24" rx="2" fill="#94A3B8" />
      <rect x="195" y="210" width="20" height="24" rx="2" fill="#94A3B8" />
      <rect x="165" y="250" width="20" height="24" rx="2" fill="#94A3B8" />
      <rect x="195" y="250" width="20" height="24" rx="2" fill="#94A3B8" />

      <rect x="250" y="190" width="80" height="210" rx="4" fill="#E2E8F0" />
      <rect x="268" y="210" width="18" height="20" rx="2" fill="#CBD5E1" />
      <rect x="295" y="210" width="18" height="20" rx="2" fill="#CBD5E1" />
      <rect x="268" y="245" width="18" height="20" rx="2" fill="#CBD5E1" />
      <rect x="295" y="245" width="18" height="20" rx="2" fill="#CBD5E1" />

      {/* Modern Public Infrastructure Road */}
      <rect x="20" y="380" width="600" height="50" rx="6" fill="#08254F" />
      {/* Dashed Road Markings */}
      <rect x="60" y="403" width="50" height="5" rx="2" fill="#FFFFFF" />
      <rect x="150" y="403" width="50" height="5" rx="2" fill="#FFFFFF" />
      <rect x="240" y="403" width="50" height="5" rx="2" fill="#FFFFFF" />
      <rect x="330" y="403" width="50" height="5" rx="2" fill="#FFFFFF" />
      <rect x="420" y="403" width="50" height="5" rx="2" fill="#FFFFFF" />
      <rect x="510" y="403" width="50" height="5" rx="2" fill="#FFFFFF" />

      {/* Road Damage / Pothole Indicator */}
      <ellipse cx="185" cy="405" rx="24" ry="11" fill="#051A38" />
      <ellipse cx="185" cy="405" rx="18" ry="7" fill="#020E22" />
      {/* Safety Hazard Warning Cone */}
      <polygon points="175,396 195,396 189,372 181,372" fill="#FF9500" />
      <rect x="171" y="396" width="28" height="4" rx="1" fill="#FFFFFF" />
      <rect x="180" y="382" width="10" height="3" fill="#FFFFFF" />

      {/* Streetlight */}
      <rect x="95" y="230" width="6" height="150" rx="2" fill="#475569" />
      <path d="M98 230 C98 215, 125 210, 132 214" stroke="#475569" strokeWidth="5" strokeLinecap="round" fill="none" />
      <polygon points="126,215 138,215 135,225 129,225" fill="#334155" />
      <circle cx="132" cy="227" r="4" fill="#FF9500" />
      <polygon points="132,228 100,380 170,380" fill="#FF9500" fillOpacity="0.12" />

      {/* Civic Infrastructure Location Pin */}
      <g transform="translate(160, 290)">
        <path
          d="M25 0C11.19 0 0 11.19 0 25C0 41.5 25 65 25 65C25 65 50 41.5 50 25C50 11.19 38.81 0 25 0Z"
          fill="#2563EB"
        />
        <circle cx="25" cy="24" r="10" fill="#FFFFFF" />
        <circle cx="25" cy="24" r="5" fill="#FF9500" />
      </g>

      {/* Citizen Mobile Reporting Device UI */}
      <g transform="translate(360, 70)">
        {/* Phone Body */}
        <rect x="0" y="0" width="240" height="360" rx="20" fill="#08254F" stroke="#1E293B" strokeWidth="4" />
        <rect x="12" y="16" width="216" height="328" rx="12" fill="#FFFFFF" />
        {/* Notch */}
        <rect x="85" y="20" width="70" height="8" rx="4" fill="#08254F" />

        {/* Mobile Header */}
        <rect x="24" y="38" width="110" height="12" rx="3" fill="#08254F" />
        <rect x="24" y="55" width="70" height="8" rx="2" fill="#94A3B8" />

        {/* Active Ticket Card Preview */}
        <rect x="24" y="74" width="192" height="110" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        {/* Category Pill (Subtle 6px, flat) */}
        <rect x="36" y="86" width="56" height="18" rx="4" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
        <text x="44" y="99" fill="#2563EB" fontSize="9" fontFamily="sans-serif" fontWeight="600">Roads</text>

        {/* Status Badge */}
        <rect x="142" y="86" width="62" height="18" rx="4" fill="#FFF8ED" stroke="#FFEECF" strokeWidth="1" />
        <text x="148" y="99" fill="#FF9500" fontSize="9" fontFamily="sans-serif" fontWeight="600">In Progress</text>

        {/* Ticket Details */}
        <text x="36" y="122" fill="#08254F" fontSize="11" fontFamily="sans-serif" fontWeight="700">Pothole on Main Road</text>
        <text x="36" y="138" fill="#64748B" fontSize="9" fontFamily="sans-serif">Ticket: TF-2026-00421</text>
        <text x="36" y="152" fill="#64748B" fontSize="9" fontFamily="sans-serif">Assigned: Roads Department</text>

        {/* Progress Timeline Stepper in Mobile UI */}
        <rect x="24" y="196" width="192" height="136" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <text x="36" y="214" fill="#08254F" fontSize="10" fontFamily="sans-serif" fontWeight="700">Resolution Steps</text>

        {/* Step 1: Reported */}
        <circle cx="42" cy="232" r="5" fill="#16A34A" />
        <text x="56" y="235" fill="#08254F" fontSize="9" fontFamily="sans-serif" fontWeight="600">1. Reported by Citizen</text>
        <line x1="42" y1="237" x2="42" y2="255" stroke="#CBD5E1" strokeWidth="2" />

        {/* Step 2: Assigned */}
        <circle cx="42" cy="260" r="5" fill="#2563EB" />
        <text x="56" y="263" fill="#08254F" fontSize="9" fontFamily="sans-serif" fontWeight="600">2. Assigned to Field Team</text>
        <line x1="42" y1="265" x2="42" y2="283" stroke="#CBD5E1" strokeWidth="2" />

        {/* Step 3: Resolution */}
        <circle cx="42" cy="288" r="5" fill="#FF9500" />
        <text x="56" y="291" fill="#08254F" fontSize="9" fontFamily="sans-serif" fontWeight="600">3. Work in Progress</text>

        {/* Mobile Action Button */}
        <rect x="36" y="306" width="168" height="18" rx="6" fill="#2563EB" />
        <text x="92" y="319" fill="#FFFFFF" fontSize="9" fontFamily="sans-serif" fontWeight="600">View Full Timeline</text>
      </g>
    </svg>
  );
}
