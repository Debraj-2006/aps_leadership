// Gadgets from Doraemon's pocket, one for each section of the hub, drawn in the same
// soft-shaded, ink-outlined style as the dashboard Doraemon. Each is a 120 × 120 drawing.

const INK = "#13223b";

export type GadgetName =
  | "door"
  | "pocket"
  | "bell"
  | "clock"
  | "copter"
  | "trophy"
  | "dorayaki"
  | "pipes"
  | "ballot"
  | "stamp"
  | "tv"
  | "megaphone"
  | "camera";

function Svg({ children, className, label }: { children: React.ReactNode; className?: string; label: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" data-gadget={label}>
      {children}
    </svg>
  );
}

function Sparkle({ x, y, r = 5, fill = "#ffcf00" }: { x: number; y: number; r?: number; fill?: string }) {
  const k = r * 0.3;
  return (
    <path
      d={`M ${x} ${y - r} Q ${x + k} ${y - k} ${x + r} ${y} Q ${x + k} ${y + k} ${x} ${y + r} Q ${x - k} ${y + k} ${x - r} ${y} Q ${x - k} ${y - k} ${x} ${y - r} Z`}
      fill={fill}
    />
  );
}

/** Anywhere Door: a pink door, open a crack onto a bright sky. */
function Door({ className }: { className?: string }) {
  return (
    <Svg className={className} label="door">
      <defs>
        <linearGradient id="gd-door" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff9fcb" />
          <stop offset="1" stopColor="#ee5f9c" />
        </linearGradient>
        <linearGradient id="gd-door-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bff0ff" />
          <stop offset="1" stopColor="#6fd0ff" />
        </linearGradient>
        <radialGradient id="gd-knob" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset="1" stopColor="#c99400" />
        </radialGradient>
      </defs>
      <rect x="28" y="10" width="64" height="100" rx="5" fill="#d9478a" stroke={INK} strokeWidth="2.6" />
      <rect x="34" y="16" width="52" height="94" fill="url(#gd-door-sky)" />
      <path d="M 34 16 L 76 20 L 76 106 L 34 110 Z" fill="url(#gd-door)" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 41 27 L 69 29 L 69 55 L 41 55 Z" fill="none" stroke="#c9407c" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M 41 63 L 69 63 L 69 95 L 41 97 Z" fill="none" stroke="#c9407c" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="37" y="20" width="3.5" height="84" rx="1.7" fill="#ffffff" opacity="0.35" />
      <circle cx="70" cy="66" r="4.6" fill="url(#gd-knob)" stroke={INK} strokeWidth="1.6" />
      <rect x="22" y="108" width="76" height="7" rx="3.5" fill="#b8396f" stroke={INK} strokeWidth="2.2" />
      <Sparkle x={82} y={40} r={5} fill="#ffffff" />
      <Sparkle x={101} y={24} r={6} />
    </Svg>
  );
}

/** The 4D pocket on Doraemon's tummy, with papers peeking out. */
function Pocket({ className }: { className?: string }) {
  return (
    <Svg className={className} label="pocket">
      <defs>
        <radialGradient id="gd-tummy-blue" cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#63cdf8" />
          <stop offset="0.6" stopColor="#1a9fe4" />
          <stop offset="1" stopColor="#0a6fb5" />
        </radialGradient>
        <radialGradient id="gd-tummy-white" cx="0.42" cy="0.3" r="0.85">
          <stop offset="0.55" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d6e3ee" />
        </radialGradient>
        <clipPath id="gd-tummy-clip">
          <circle cx="60" cy="62" r="41" />
        </clipPath>
      </defs>
      <circle cx="60" cy="62" r="52" fill="url(#gd-tummy-blue)" stroke={INK} strokeWidth="2.6" />
      <circle cx="60" cy="62" r="41" fill="url(#gd-tummy-white)" stroke={INK} strokeWidth="2.2" />
      <g clipPath="url(#gd-tummy-clip)">
        <g transform="rotate(-10 52 52)">
          <rect x="38" y="30" width="28" height="38" rx="2.5" fill="#ffffff" stroke={INK} strokeWidth="2" />
          <path d="M 43 39 H 61 M 43 46 H 61 M 43 53 H 56" stroke="#8ea3b6" strokeWidth="1.8" strokeLinecap="round" />
        </g>
        <g transform="rotate(16 78 52)">
          <rect x="71" y="32" width="13" height="34" rx="6.5" fill="#ffe7a3" stroke={INK} strokeWidth="2" />
          <rect x="71" y="45" width="13" height="5" fill="#e5132a" stroke={INK} strokeWidth="1.4" />
        </g>
      </g>
      <path d="M 28 66 A 32 32 0 0 0 92 66 Z" fill="#ffffff" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M 34 70 A 26 26 0 0 0 86 70" fill="none" stroke="#9fb3c6" strokeWidth="1.6" strokeDasharray="3.5 3.5" strokeLinecap="round" />
      <ellipse cx="34" cy="26" rx="10" ry="5" fill="#ffffff" opacity="0.35" transform="rotate(-35 34 26)" />
      <Sparkle x={106} y={14} r={6} />
      <Sparkle x={12} y={104} r={4.5} fill="#ffffff" />
    </Svg>
  );
}

/** Doraemon's golden bell on a stretch of red collar. */
function Bell({ className }: { className?: string }) {
  return (
    <Svg className={className} label="bell">
      <defs>
        <radialGradient id="gd-bell" cx="0.34" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff3ad" />
          <stop offset="0.45" stopColor="#f6c531" />
          <stop offset="1" stopColor="#b98200" />
        </radialGradient>
        <linearGradient id="gd-collar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef3a43" />
          <stop offset="1" stopColor="#b5121f" />
        </linearGradient>
        <clipPath id="gd-bell-clip">
          <circle cx="60" cy="70" r="33" />
        </clipPath>
      </defs>
      <path d="M 10 30 Q 60 56 110 30" fill="none" stroke={INK} strokeWidth="16" strokeLinecap="round" />
      <path d="M 10 30 Q 60 56 110 30" fill="none" stroke="url(#gd-collar)" strokeWidth="11.5" strokeLinecap="round" />
      <circle cx="60" cy="70" r="33" fill="url(#gd-bell)" stroke={INK} strokeWidth="2.6" />
      <g clipPath="url(#gd-bell-clip)">
        <path d="M 20 60 H 100 M 20 67 H 100" stroke="#7a5600" strokeWidth="2.6" />
      </g>
      <circle cx="60" cy="82" r="5.5" fill="#4a3300" />
      <path d="M 60 87 V 102" stroke="#4a3300" strokeWidth="3.6" strokeLinecap="round" />
      <ellipse cx="47" cy="50" rx="8" ry="5" fill="#ffffff" opacity="0.75" transform="rotate(-30 47 50)" />
      <Sparkle x={100} y={70} r={6} />
      <Sparkle x={16} y={84} r={5} fill="#ffffff" />
    </Svg>
  );
}

/** A clock wrapped in turning arrows: time passing to the next team. */
function Clock({ className }: { className?: string }) {
  return (
    <Svg className={className} label="clock">
      <defs>
        <radialGradient id="gd-face" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0.6" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9e5ef" />
        </radialGradient>
      </defs>
      <path d="M 18 52 A 43 43 0 0 1 92 24" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <path d="M 18 52 A 43 43 0 0 1 92 24" fill="none" stroke="#ffcf00" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M 86 14 L 100 26 L 82 32 Z" fill="#ffcf00" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 102 68 A 43 43 0 0 1 28 96" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <path d="M 102 68 A 43 43 0 0 1 28 96" fill="none" stroke="#e5132a" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M 34 106 L 20 94 L 38 88 Z" fill="#e5132a" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="60" cy="60" r="30" fill="#1a9fe4" stroke={INK} strokeWidth="2.6" />
      <circle cx="60" cy="60" r="23" fill="url(#gd-face)" stroke={INK} strokeWidth="2" />
      <g stroke={INK} strokeWidth="2.4" strokeLinecap="round">
        <path d="M 60 41 V 45 M 79 60 H 75 M 60 79 V 75 M 41 60 H 45" />
        <path d="M 60 60 L 50 52" strokeWidth="3.2" />
        <path d="M 60 60 L 71 48" />
      </g>
      <circle cx="60" cy="60" r="3.2" fill="#e5132a" stroke={INK} strokeWidth="1.4" />
    </Svg>
  );
}

/** Bamboo-copter, blades spinning. */
function Copter({ className }: { className?: string }) {
  return (
    <Svg className={className} label="copter">
      <defs>
        <radialGradient id="gd-cap" cx="0.35" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="1" stopColor="#e89a00" />
        </radialGradient>
        <linearGradient id="gd-blade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe68a" />
          <stop offset="1" stopColor="#f5b800" />
        </linearGradient>
      </defs>
      <g className="gadget-spin">
        <ellipse cx="60" cy="34" rx="48" ry="9.5" fill="url(#gd-blade)" stroke={INK} strokeWidth="2.4" />
      </g>
      <path d="M 18 22 Q 10 34 18 46 M 102 22 Q 110 34 102 46" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
      <rect x="56.5" y="36" width="7" height="34" rx="3.5" fill="url(#gd-blade)" stroke={INK} strokeWidth="2.2" />
      <circle cx="60" cy="34" r="6" fill="#f08a00" stroke={INK} strokeWidth="2.2" />
      <path d="M 36 92 Q 36 68 60 68 Q 84 68 84 92 Z" fill="url(#gd-cap)" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M 32 92 H 88" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <ellipse cx="50" cy="76" rx="6" ry="3.5" fill="#ffffff" opacity="0.6" transform="rotate(-25 50 76)" />
      <Sparkle x={98} y={80} r={6} />
      <Sparkle x={22} y={74} r={4.5} fill="#ffffff" />
    </Svg>
  );
}

/** A golden trophy wearing Doraemon's collar and bell. */
function Trophy({ className }: { className?: string }) {
  return (
    <Svg className={className} label="trophy">
      <defs>
        <linearGradient id="gd-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="0.5" stopColor="#f6c531" />
          <stop offset="1" stopColor="#c99400" />
        </linearGradient>
        <radialGradient id="gd-tbell" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff3ad" />
          <stop offset="1" stopColor="#d9a300" />
        </radialGradient>
      </defs>
      <path d="M 34 30 C 14 30 14 60 40 62" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <path d="M 34 30 C 14 30 14 60 40 62" fill="none" stroke="#f6c531" strokeWidth="5" strokeLinecap="round" />
      <path d="M 86 30 C 106 30 106 60 80 62" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <path d="M 86 30 C 106 30 106 60 80 62" fill="none" stroke="#f6c531" strokeWidth="5" strokeLinecap="round" />
      <path d="M 32 18 H 88 V 42 C 88 64 76 76 60 78 C 44 76 32 64 32 42 Z" fill="url(#gd-gold)" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <rect x="54" y="78" width="12" height="12" fill="url(#gd-gold)" stroke={INK} strokeWidth="2.2" />
      <rect x="36" y="89" width="48" height="18" rx="4" fill="#1a9fe4" stroke={INK} strokeWidth="2.6" />
      <rect x="36" y="94" width="48" height="5" fill="#e5132a" />
      <path d="M 36 94 H 84 M 36 99 H 84" stroke={INK} strokeWidth="1.4" />
      <circle cx="60" cy="42" r="10" fill="url(#gd-tbell)" stroke="#7a5600" strokeWidth="1.8" />
      <path d="M 50.5 39 H 69.5" stroke="#7a5600" strokeWidth="1.6" />
      <circle cx="60" cy="45" r="2" fill="#4a3300" />
      <path d="M 60 46.5 V 51" stroke="#4a3300" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="38" y="22" width="5" height="30" rx="2.5" fill="#ffffff" opacity="0.4" />
      <Sparkle x={100} y={14} r={6} />
      <Sparkle x={18} y={84} r={5} fill="#ffffff" />
    </Svg>
  );
}

/** Dorayaki, Doraemon's favourite treat. */
function Dorayaki({ className }: { className?: string }) {
  return (
    <Svg className={className} label="dorayaki">
      <defs>
        <radialGradient id="gd-cake-top" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#b5651d" />
          <stop offset="0.75" stopColor="#d98b32" />
          <stop offset="1" stopColor="#f2b75b" />
        </radialGradient>
        <linearGradient id="gd-cake-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe2a6" />
          <stop offset="1" stopColor="#e9a64a" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="98" rx="40" ry="5" fill="#000000" opacity="0.18" />
      <path d="M 16 74 Q 16 94 60 94 Q 104 94 104 74 Z" fill="url(#gd-cake-side)" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M 15 70 Q 60 84 105 70 L 105 76 Q 60 90 15 76 Z" fill="#5b2a14" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 14 70 Q 14 38 60 38 Q 106 38 106 70 Q 60 82 14 70 Z" fill="url(#gd-cake-side)" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <ellipse cx="60" cy="54" rx="40" ry="14" fill="url(#gd-cake-top)" />
      <ellipse cx="46" cy="49" rx="10" ry="4" fill="#ffffff" opacity="0.28" />
      <Sparkle x={102} y={30} r={6} />
      <Sparkle x={18} y={32} r={4.5} fill="#ffffff" />
    </Svg>
  );
}

/** The three concrete pipes in the empty lot where everyone meets. */
function Pipes({ className }: { className?: string }) {
  const pipe = (cx: number, cy: number) => (
    <g key={`${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r="23" fill="#b9c3cd" stroke={INK} strokeWidth="2.6" />
      <circle cx={cx} cy={cy} r="14.5" fill="#3a4658" stroke={INK} strokeWidth="1.8" />
      <path d={`M ${cx - 16} ${cy - 9} A 18 18 0 0 1 ${cx - 4} ${cy - 18}`} fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
    </g>
  );
  return (
    <Svg className={className} label="pipes">
      <path d="M 6 104 Q 60 92 114 104 L 114 112 L 6 112 Z" fill="#5fbf3a" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 14 102 l 3 -7 l 3 7 M 98 101 l 3 -8 l 3 8 M 58 96 l 3 -6 l 3 6" fill="none" stroke="#3f9a24" strokeWidth="2" strokeLinejoin="round" />
      {pipe(37, 78)}
      {pipe(83, 78)}
      {pipe(60, 39)}
      <Sparkle x={102} y={26} r={6} />
      <Sparkle x={16} y={40} r={4.5} fill="#ffffff" />
    </Svg>
  );
}

/** A ballot box dressed like Doraemon: blue body, white belly, red collar. */
function Ballot({ className }: { className?: string }) {
  return (
    <Svg className={className} label="ballot">
      <defs>
        <linearGradient id="gd-box" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4cc0f5" />
          <stop offset="1" stopColor="#0a73b8" />
        </linearGradient>
      </defs>
      <g transform="rotate(-6 60 30)">
        <rect x="46" y="8" width="28" height="36" rx="2.5" fill="#ffffff" stroke={INK} strokeWidth="2.2" />
        <path d="M 52 26 L 58 32 L 69 18" fill="none" stroke="#1a9fe4" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <rect x="20" y="46" width="80" height="62" rx="10" fill="url(#gd-box)" stroke={INK} strokeWidth="2.6" />
      <rect x="17" y="40" width="86" height="12" rx="5" fill="#e5132a" stroke={INK} strokeWidth="2.4" />
      <rect x="42" y="43.5" width="36" height="5" rx="2.5" fill={INK} />
      <circle cx="60" cy="80" r="20" fill="#ffffff" stroke={INK} strokeWidth="2.2" />
      <path d="M 47 81 A 13 13 0 0 0 73 81 Z" fill="#ffffff" stroke="#8ea3b6" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="24" y="56" width="4" height="40" rx="2" fill="#ffffff" opacity="0.3" />
      <Sparkle x={100} y={20} r={6} />
      <Sparkle x={18} y={24} r={4.5} fill="#ffffff" />
    </Svg>
  );
}

/** A name stamp (hanko) and its red approval seal. */
function Stamp({ className }: { className?: string }) {
  return (
    <Svg className={className} label="stamp">
      <defs>
        <linearGradient id="gd-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f1c48a" />
          <stop offset="1" stopColor="#b9773d" />
        </linearGradient>
      </defs>
      <g opacity="0.95">
        <circle cx="76" cy="82" r="24" fill="none" stroke="#e5132a" strokeWidth="4" />
        <circle cx="76" cy="82" r="18" fill="none" stroke="#e5132a" strokeWidth="1.6" opacity="0.7" />
        <path d="M 66 82 L 73 89 L 87 74" fill="none" stroke="#e5132a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform="rotate(-18 40 46)">
        <path d="M 28 64 V 26 Q 28 12 40 12 Q 52 12 52 26 V 64 Z" fill="url(#gd-wood)" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <rect x="24" y="62" width="32" height="12" rx="3" fill="#2e3b52" stroke={INK} strokeWidth="2.4" />
        <rect x="24" y="72" width="32" height="5" rx="2" fill="#e5132a" stroke={INK} strokeWidth="2" />
        <rect x="32" y="20" width="4" height="36" rx="2" fill="#ffffff" opacity="0.35" />
      </g>
      <Sparkle x={104} y={50} r={6} />
      <Sparkle x={14} y={98} r={4.5} fill="#ffffff" />
    </Svg>
  );
}

/** Time TV: a retro set that shows what happened. */
function Tv({ className }: { className?: string }) {
  return (
    <Svg className={className} label="tv">
      <defs>
        <linearGradient id="gd-tv" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="1" stopColor="#f2a900" />
        </linearGradient>
        <linearGradient id="gd-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#123b7a" />
          <stop offset="1" stopColor="#2a7fd0" />
        </linearGradient>
      </defs>
      <path d="M 52 36 L 36 12 M 68 36 L 86 10" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="36" cy="12" r="4" fill="#e5132a" stroke={INK} strokeWidth="2" />
      <circle cx="86" cy="10" r="4" fill="#e5132a" stroke={INK} strokeWidth="2" />
      <rect x="40" y="30" width="40" height="8" rx="4" fill="#2e3b52" stroke={INK} strokeWidth="2" />
      <rect x="14" y="36" width="92" height="66" rx="14" fill="url(#gd-tv)" stroke={INK} strokeWidth="2.6" />
      <rect x="22" y="44" width="60" height="50" rx="9" fill="url(#gd-screen)" stroke={INK} strokeWidth="2.2" />
      <path d="M 28 72 H 38 L 43 60 L 50 82 L 56 66 L 60 72 H 76" fill="none" stroke="#9ff0ff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="94" cy="56" r="5" fill="#ffffff" stroke={INK} strokeWidth="2" />
      <circle cx="94" cy="74" r="5" fill="#ffffff" stroke={INK} strokeWidth="2" />
      <path d="M 26 102 L 22 110 M 94 102 L 98 110" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <rect x="26" y="48" width="12" height="4" rx="2" fill="#ffffff" opacity="0.35" />
      <Sparkle x={106} y={22} r={5.5} />
    </Svg>
  );
}

/** A megaphone for announcements, sound waves rolling out. */
function Megaphone({ className }: { className?: string }) {
  return (
    <Svg className={className} label="megaphone">
      <defs>
        <linearGradient id="gd-horn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff6b6b" />
          <stop offset="1" stopColor="#d61f2c" />
        </linearGradient>
        <radialGradient id="gd-rim" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff3ad" />
          <stop offset="1" stopColor="#d9a300" />
        </radialGradient>
      </defs>
      <path d="M 42 64 L 36 92 Q 35 96 39 96 L 47 96 Q 50 96 51 93 L 56 66 Z" fill="#2e3b52" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="14" y="46" width="16" height="24" rx="5" fill="#2e3b52" stroke={INK} strokeWidth="2.4" />
      <path d="M 28 48 L 76 26 L 76 90 L 28 68 Z" fill="url(#gd-horn)" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M 34 52 L 70 35" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <ellipse cx="77" cy="58" rx="9" ry="33" fill="url(#gd-rim)" stroke={INK} strokeWidth="2.6" />
      <ellipse cx="78.5" cy="58" rx="4.5" ry="25" fill="#7a0a10" />
      <path d="M 94 42 Q 103 58 94 74" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M 102 33 Q 116 58 102 83" fill="none" stroke="#ffcf00" strokeWidth="3.2" strokeLinecap="round" />
      <Sparkle x={104} y={16} r={5.5} />
      <Sparkle x={16} y={26} r={4.5} fill="#ffffff" />
    </Svg>
  );
}

/** A camera for profile photos, in Doraemon blue with a white lens ring. */
function Camera({ className }: { className?: string }) {
  return (
    <Svg className={className} label="camera">
      <defs>
        <linearGradient id="gd-cam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4cc0f5" />
          <stop offset="1" stopColor="#0a73b8" />
        </linearGradient>
        <radialGradient id="gd-lens" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#7fd3ff" />
          <stop offset="0.6" stopColor="#1d5fb0" />
          <stop offset="1" stopColor="#0d2a5c" />
        </radialGradient>
      </defs>
      <rect x="30" y="28" width="30" height="16" rx="4" fill="#2e3b52" stroke={INK} strokeWidth="2.4" />
      <rect x="80" y="31" width="16" height="11" rx="3" fill="#e5132a" stroke={INK} strokeWidth="2.2" />
      <rect x="12" y="40" width="96" height="62" rx="13" fill="url(#gd-cam)" stroke={INK} strokeWidth="2.6" />
      <rect x="12" y="84" width="96" height="7" fill="#ffffff" opacity="0.9" />
      <path d="M 12 84 H 108 M 12 91 H 108" stroke={INK} strokeWidth="1.6" />
      <rect x="20" y="48" width="16" height="10" rx="2.5" fill="#fff3ad" stroke={INK} strokeWidth="2" />
      <circle cx="62" cy="69" r="25" fill="#ffffff" stroke={INK} strokeWidth="2.6" />
      <circle cx="62" cy="69" r="17" fill="url(#gd-lens)" stroke={INK} strokeWidth="2.2" />
      <circle cx="56" cy="63" r="4.5" fill="#ffffff" opacity="0.85" />
      <circle cx="68" cy="75" r="2" fill="#ffffff" opacity="0.6" />
      <rect x="16" y="45" width="4" height="34" rx="2" fill="#ffffff" opacity="0.3" />
      <Sparkle x={104} y={18} r={6} />
      <Sparkle x={14} y={20} r={4.5} fill="#ffffff" />
    </Svg>
  );
}

const GADGETS: Record<GadgetName, (p: { className?: string }) => React.ReactElement> = {
  door: Door,
  pocket: Pocket,
  bell: Bell,
  clock: Clock,
  copter: Copter,
  trophy: Trophy,
  dorayaki: Dorayaki,
  pipes: Pipes,
  ballot: Ballot,
  stamp: Stamp,
  tv: Tv,
  megaphone: Megaphone,
  camera: Camera,
};

export const GADGET_NAMES = Object.keys(GADGETS) as GadgetName[];

export function Gadget({ name, className }: { name: GadgetName; className?: string }) {
  const Drawing = GADGETS[name];
  return <Drawing className={className} />;
}
