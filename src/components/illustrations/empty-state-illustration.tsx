export function EmptyStateIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Base shadow plate */}
      <rect x="25" y="140" width="150" height="8" rx="4" fill="#E2E8F0" />

      {/* Clipboard Body */}
      <rect x="45" y="30" width="110" height="110" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />

      {/* Clipboard Clip */}
      <rect x="75" y="20" width="50" height="18" rx="4" fill="#08254F" />
      <rect x="88" y="25" width="24" height="6" rx="2" fill="#FF9500" />

      {/* Content lines on clipboard */}
      <rect x="60" y="55" width="80" height="6" rx="3" fill="#E2E8F0" />
      <rect x="60" y="72" width="60" height="6" rx="3" fill="#E2E8F0" />
      <rect x="60" y="89" width="70" height="6" rx="3" fill="#E2E8F0" />

      {/* Clean verification checkmark emblem */}
      <circle cx="130" cy="110" r="18" fill="#2563EB" />
      <path
        d="M123 110L128 115L138 105"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
