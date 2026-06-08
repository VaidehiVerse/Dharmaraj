import React from "react";

/** Decorative SVG layers for the luxury Ayurvedic hero — sun, mountains, water, leaves. */
export const SunRays = () => (
  <div className="sun-rays" aria-hidden>
    {Array.from({ length: 12 }).map((_, i) => (
      <span key={i} style={{ transform: `translate(-50%, -50%) rotate(${i * 30}deg)`, animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

export const Mountains = () => (
  <svg viewBox="0 0 1440 320" className="mountains-svg" aria-hidden>
    <defs>
      <linearGradient id="mountFar" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#a8c89b" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#88b66d" stopOpacity="0.7" />
      </linearGradient>
      <linearGradient id="mountNear" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#4f8557" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#2d5e3e" stopOpacity="1" />
      </linearGradient>
    </defs>
    <path
      d="M0,220 L120,140 L260,200 L380,90 L520,180 L640,110 L780,190 L900,120 L1050,200 L1180,130 L1300,200 L1440,150 L1440,320 L0,320 Z"
      fill="url(#mountFar)"
    />
    <path
      d="M0,260 L100,200 L220,240 L340,170 L480,230 L600,180 L740,240 L860,180 L1000,250 L1140,200 L1280,260 L1440,220 L1440,320 L0,320 Z"
      fill="url(#mountNear)"
    />
  </svg>
);

export const WaterWave = () => (
  <svg viewBox="0 0 1500 60" preserveAspectRatio="none" className="water-wave" aria-hidden>
    <defs>
      <linearGradient id="waterG" x1="0" x2="1">
        <stop offset="0%" stopColor="#7bb7d9" stopOpacity="0.3" />
        <stop offset="50%" stopColor="#a8d4e8" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#7bb7d9" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <path d="M0,30 Q150,5 300,30 T600,30 T900,30 T1200,30 T1500,30 V60 H0 Z" fill="url(#waterG)" />
    <path d="M0,40 Q150,15 300,40 T600,40 T900,40 T1200,40 T1500,40 V60 H0 Z" fill="url(#waterG)" opacity="0.6" />
  </svg>
);

export const FloatingLeaf = ({ className = "", color = "#88b66d", size = 60, rotate = 0 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={`float-leaf ${className}`}
    style={{ transform: `rotate(${rotate}deg)` }}
    aria-hidden
  >
    <path
      d="M12 2c-3 4-7 6-7 11 0 4 3 7 7 9 4-2 7-5 7-9 0-5-4-7-7-11z"
      fill={color}
      opacity="0.85"
    />
    <path d="M12 6v15M9 12c1 1 4 1 6 0" stroke="#2d5e3e" strokeWidth="0.6" fill="none" />
  </svg>
);

export const GoldParticles = () => (
  <>
    {Array.from({ length: 10 }).map((_, i) => (
      <span
        key={i}
        className="gold-particle"
        style={{
          left: `${5 + i * 9}%`,
          bottom: `${Math.random() * 30}%`,
          animationDelay: `${i * 0.7}s`,
          animationDuration: `${7 + (i % 3)}s`,
        }}
      />
    ))}
  </>
);

/** Tulsi sprig SVG used as section ornament */
export const TulsiSprig = ({ className = "", size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
    <g stroke="#2d5e3e" strokeWidth="1.5" fill="none" strokeLinecap="round">
      <path d="M32 56 L32 12" />
      <path d="M32 22 C24 22 20 18 18 12" fill="#88b66d" fillOpacity="0.7" />
      <path d="M32 22 C40 22 44 18 46 12" fill="#88b66d" fillOpacity="0.7" />
      <path d="M32 32 C24 32 20 28 18 22" fill="#88b66d" fillOpacity="0.7" />
      <path d="M32 32 C40 32 44 28 46 22" fill="#88b66d" fillOpacity="0.7" />
      <path d="M32 42 C24 42 20 38 18 32" fill="#88b66d" fillOpacity="0.7" />
      <path d="M32 42 C40 42 44 38 46 32" fill="#88b66d" fillOpacity="0.7" />
    </g>
  </svg>
);

/** Decorative gold divider with central lotus motif */
export const GoldDivider = ({ className = "" }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`}>
    <span className="h-px w-12 bg-[var(--drj-gold)] opacity-70" />
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2 L13 8 L18 5 L15 10 L22 11 L15 13 L18 18 L13 16 L12 22 L11 16 L6 18 L9 13 L2 11 L9 10 L6 5 L11 8 Z"
        fill="#d4af37"
        opacity="0.9"
      />
    </svg>
    <span className="h-px w-12 bg-[var(--drj-gold)] opacity-70" />
  </div>
);
