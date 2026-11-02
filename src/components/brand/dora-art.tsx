// Doraemon-inspired hero art: white belly and pocket, red collar, a swinging yellow bell,
// a little flying propeller and drifting clouds. Shapes and colours only, no character drawing.
// It sits in the top-right corner of blue panels; clouds spill past the viewBox on purpose.

function Cloud({ x, y, s = 1, className }: { x: number; y: number; s?: number; className?: string }) {
  return (
    <g className={className} transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="0" cy="0" r="18" />
      <circle cx="22" cy="-8" r="24" />
      <circle cx="48" cy="0" r="18" />
      <rect x="0" y="0" width="48" height="18" rx="9" />
    </g>
  );
}

function Sparkle({ x, y, r = 8 }: { x: number; y: number; r?: number }) {
  const k = r * 0.28;
  return (
    <path
      className="dora-twinkle"
      d={`M ${x} ${y - r} Q ${x + k} ${y - k} ${x + r} ${y} Q ${x + k} ${y + k} ${x} ${y + r} Q ${x - k} ${y + k} ${x - r} ${y} Q ${x - k} ${y - k} ${x} ${y - r} Z`}
      fill="#ffcf00"
    />
  );
}

export function DoraArt({ id, className }: { id: string; className?: string }) {
  const shade = `${id}-belly-shade`;
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMaxYMid meet" overflow="visible" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={shade} cx="0.42" cy="0.35" r="0.75">
          <stop offset="0.7" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9eefb" />
        </radialGradient>
      </defs>
      <style>{`
        .dora-drift { animation: dora-drift 14s ease-in-out infinite alternate; }
        .dora-drift-slow { animation: dora-drift 20s ease-in-out infinite alternate-reverse; }
        @keyframes dora-drift { from { transform: translateX(-14px); } to { transform: translateX(14px); } }

        .dora-bell { transform-box: fill-box; transform-origin: 50% 0%; animation: dora-swing 3.2s ease-in-out infinite; }
        @keyframes dora-swing { 0%, 100% { transform: rotate(-7deg); } 50% { transform: rotate(7deg); } }

        .dora-copter { animation: dora-bob 3.6s ease-in-out infinite; }
        @keyframes dora-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .dora-blades { transform-box: fill-box; transform-origin: center; animation: dora-spin 0.35s linear infinite; }
        @keyframes dora-spin { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(0.15); } }

        .dora-twinkle { transform-box: fill-box; transform-origin: center; animation: dora-twinkle 2.8s ease-in-out infinite; }
        .dora-twinkle:nth-of-type(2n) { animation-delay: 1.3s; }
        @keyframes dora-twinkle { 0%, 100% { transform: scale(0.6); opacity: 0.5; } 50% { transform: scale(1); opacity: 1; } }

        @media (prefers-reduced-motion: reduce) {
          .dora-drift, .dora-drift-slow, .dora-bell, .dora-copter, .dora-blades, .dora-twinkle { animation: none; }
        }
      `}</style>

      {/* Clouds */}
      <g fill="#ffffff" fillOpacity="0.16">
        <g className="dora-drift">
          <Cloud x={-40} y={330} s={1.3} />
          <Cloud x={430} y={60} s={1} />
        </g>
        <g className="dora-drift-slow">
          <Cloud x={120} y={20} s={0.8} />
          <Cloud x={40} y={210} s={0.7} />
        </g>
      </g>

      {/* Belly and pocket */}
      <circle cx="315" cy="262" r="138" fill={`url(#${shade})`} />
      <path d="M 238 268 A 77 77 0 0 0 392 268 Z" fill="#ffffff" stroke="#0f2a47" strokeWidth="5" strokeLinejoin="round" />

      {/* Collar */}
      <path d="M 150 126 Q 315 206 480 126" fill="none" stroke="#e5132a" strokeWidth="28" strokeLinecap="round" />

      {/* Bell */}
      <g className="dora-bell">
        <circle cx="315" cy="176" r="36" fill="#ffcf00" stroke="#0f2a47" strokeWidth="4" />
        <path d="M 281 164 H 349 M 280 173 H 350" stroke="#0f2a47" strokeWidth="4" strokeLinecap="round" />
        <circle cx="315" cy="188" r="6.5" fill="#0f2a47" />
        <path d="M 315 194 V 210" stroke="#0f2a47" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="302" cy="152" rx="9" ry="5" fill="#ffffff" fillOpacity="0.7" transform="rotate(-25 302 152)" />
      </g>

      {/* Little flying propeller */}
      <g className="dora-copter">
        <rect x="203" y="84" width="6" height="22" rx="3" fill="#ffcf00" stroke="#0f2a47" strokeWidth="2.5" />
        <circle cx="206" cy="82" r="5" fill="#e5132a" stroke="#0f2a47" strokeWidth="2.5" />
        <ellipse className="dora-blades" cx="206" cy="78" rx="38" ry="6" fill="#ffcf00" stroke="#0f2a47" strokeWidth="2.5" />
      </g>

      <Sparkle x={150} y={300} r={9} />
      <Sparkle x={392} y={40} r={7} />
      <Sparkle x={250} y={110} r={6} />
    </svg>
  );
}
