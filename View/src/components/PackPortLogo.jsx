import React from "react";

export function PackPortIcon({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm select-none ${className}`}
    >
      <defs>
        <linearGradient id="pp-boxLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="pp-boxRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>

        <linearGradient id="pp-chipTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="pp-chipMid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="pp-chipBot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        <linearGradient id="pp-flapLeft" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id="pp-flapRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        <filter id="pp-badgeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#3b82f6"
            floodOpacity="0.4"
          />
        </filter>
      </defs>

      {/* Ambient Shadow Under Box */}
      <ellipse
        cx="100"
        cy="172"
        rx="64"
        ry="15"
        fill="#000000"
        fillOpacity="0.4"
      />

      {/* Back Flap */}
      <polygon points="100,52 136,36 100,24 64,36" fill="#1e3a8a" opacity="0.6" />

      {/* Layered Stack (Floating Modules inside box) */}
      {/* Bottom Chip (Indigo) */}
      <g>
        <polygon points="68,76 100,90 100,96 68,82" fill="#4338ca" />
        <polygon points="100,90 132,76 132,82 100,96" fill="#3730a3" />
        <polygon points="100,64 132,76 100,90 68,76" fill="url(#pp-chipBot)" />
      </g>

      {/* Middle Chip (Sky) */}
      <g>
        <polygon points="68,61 100,75 100,81 68,67" fill="#0369a1" />
        <polygon points="100,75 132,61 132,67 100,81" fill="#075985" />
        <polygon points="100,49 132,61 100,75 68,61" fill="url(#pp-chipMid)" />
      </g>

      {/* Top Chip (Blue) */}
      <g>
        <polygon points="68,46 100,60 100,66 68,52" fill="#1d4ed8" />
        <polygon points="100,60 132,46 132,52 100,66" fill="#1e40af" />
        <polygon points="100,34 132,46 100,60 68,46" fill="url(#pp-chipTop)" />
      </g>

      {/* Isometric Box Main Body */}
      <polygon points="46,84 100,108 100,166 46,140" fill="url(#pp-boxLeft)" />
      <polygon points="100,108 154,84 154,140 100,166" fill="url(#pp-boxRight)" />

      {/* Open Flaps */}
      <polygon points="46,84 100,108 84,124 32,98" fill="url(#pp-flapLeft)" />
      <polygon points="100,108 154,84 168,98 116,124" fill="url(#pp-flapRight)" />

      <polygon points="46,84 32,58 56,50 68,74" fill="#3b82f6" />
      <polygon points="154,84 168,58 144,50 132,74" fill="#2563eb" />

      {/* Left Face Code Brackets Icon </> */}
      <g
        transform="translate(62, 118)"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      >
        <path d="M 0,2 L -8,7 L 0,12" />
        <path d="M 16,2 L 24,7 L 16,12" />
        <line x1="10" y1="1" x2="6" y2="13" />
      </g>

      {/* Right Face Telemetry Lines */}
      <g
        transform="translate(112, 118)"
        stroke="#93c5fd"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      >
        <line x1="0" y1="2" x2="22" y2="2" />
        <line x1="0" y1="7" x2="16" y2="7" />
        <line x1="0" y1="12" x2="20" y2="12" />
      </g>

      {/* Verified Status Floating Badge */}
      <g filter="url(#pp-badgeGlow)">
        <circle cx="150" cy="144" r="18" fill="#10b981" />
        <circle cx="150" cy="144" r="15" fill="#059669" />
        <path
          d="M142 144 L147 149 L158 138"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export default function PackPortLogo({
  size = 36,
  showBadge = true,
  className = "",
  tagline = false,
}) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <PackPortIcon size={size} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight text-white flex items-center">
            <span>pack</span>
            <span className="text-blue-500">port</span>
          </span>
          {showBadge && (
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-slate-700/80 bg-slate-800/80 text-slate-300">
              v1.0
            </span>
          )}
        </div>
        {tagline && (
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">
            Versions • States • Clarity
          </span>
        )}
      </div>
    </div>
  );
}
