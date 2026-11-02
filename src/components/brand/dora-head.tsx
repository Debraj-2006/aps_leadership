"use client";

import { cn } from "@/lib/utils";
import { useFollowEyes } from "@/components/brand/use-follow-eyes";

// Doraemon's head with a gentle closed smile, drawn as a soft-shaded vector.
// His eyes follow the pointer and he blinks now and then.

// Coordinates are in the viewBox below; the head is centred on x = 120.
const VB = { x: 18, y: 2, w: 204, h: 222 };
const EYES = [
  { cx: 106, cy: 70, maxX: 7, maxY: 9 },
  { cx: 134, cy: 70, maxX: 7, maxY: 9 },
];

const INK = "#13223b";
const HEAD = { cx: 120, cy: 100, rx: 96, ry: 92 };
const COLLAR = "M 66 178 Q 120 214 174 178";

const CSS = `
  .dora-head .pupil { transition: transform 90ms ease-out; }
  .dora-head .eye { transform-box: fill-box; transform-origin: center; animation: dora-head-blink 5.5s infinite; }
  @keyframes dora-head-blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.08); } }
  @media (prefers-reduced-motion: reduce) {
    .dora-head .eye { animation: none; }
    .dora-head .pupil { transition: none; }
  }
`;

export function DoraHead({ className }: { className?: string }) {
  const { svgRef, pupilRef } = useFollowEyes(EYES, VB.w);

  return (
    <svg
      ref={svgRef}
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      className={cn("dora-head overflow-visible", className)}
      aria-hidden="true"
    >
      <style>{CSS}</style>
      <defs>
        <radialGradient id="dora-head-blue" cx="0.36" cy="0.3" r="0.78">
          <stop offset="0" stopColor="#63cdf8" />
          <stop offset="0.55" stopColor="#1a9fe4" />
          <stop offset="1" stopColor="#0a6fb5" />
        </radialGradient>
        <radialGradient id="dora-head-white" cx="0.42" cy="0.32" r="0.8">
          <stop offset="0.55" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9e5ef" />
        </radialGradient>
        <radialGradient id="dora-head-red" cx="0.34" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ff7468" />
          <stop offset="0.55" stopColor="#e1222b" />
          <stop offset="1" stopColor="#a30d16" />
        </radialGradient>
        <radialGradient id="dora-head-gold" cx="0.34" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset="0.45" stopColor="#f6c531" />
          <stop offset="1" stopColor="#b98200" />
        </radialGradient>
        <linearGradient id="dora-head-collar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef3a43" />
          <stop offset="1" stopColor="#b5121f" />
        </linearGradient>
        <clipPath id="dora-head-clip">
          <ellipse cx={HEAD.cx} cy={HEAD.cy} rx={HEAD.rx} ry={HEAD.ry} />
        </clipPath>
      </defs>

      {/* Collar, tucked under the chin */}
      <path d={COLLAR} fill="none" stroke={INK} strokeWidth="19" strokeLinecap="round" />
      <path d={COLLAR} fill="none" stroke="url(#dora-head-collar)" strokeWidth="14.5" strokeLinecap="round" />

      {/* Head and face */}
      <ellipse
        cx={HEAD.cx}
        cy={HEAD.cy}
        rx={HEAD.rx}
        ry={HEAD.ry}
        fill="url(#dora-head-blue)"
        stroke={INK}
        strokeWidth="3"
      />
      <g clipPath="url(#dora-head-clip)">
        <ellipse cx="120" cy="122" rx="84" ry="71" fill="url(#dora-head-white)" stroke={INK} strokeWidth="2.4" />
      </g>
      <ellipse cx="74" cy="38" rx="28" ry="11" fill="#ffffff" opacity="0.32" transform="rotate(-35 74 38)" />

      {/* Eyes */}
      {[101, 139].map((cx, i) => (
        <g key={cx} className="eye">
          <ellipse cx={cx} cy="66" rx="19" ry="25" fill="#ffffff" stroke={INK} strokeWidth="2.6" />
          <g ref={pupilRef(i)} className="pupil">
            <ellipse cx={EYES[i].cx} cy={EYES[i].cy} rx="5" ry="6.6" fill="#111318" />
            <circle cx={EYES[i].cx + 1.6} cy={EYES[i].cy - 2.6} r="1.8" fill="#ffffff" />
          </g>
        </g>
      ))}

      {/* Whiskers */}
      <g stroke={INK} strokeWidth="2.3" strokeLinecap="round">
        <path d="M 92 100 L 50 90" />
        <path d="M 90 110 L 46 109" />
        <path d="M 92 120 L 50 126" />
        <path d="M 148 100 L 190 90" />
        <path d="M 150 110 L 194 109" />
        <path d="M 148 120 L 190 126" />
      </g>

      {/* Nose, and a gentle closed smile */}
      <path d="M 120 104 V 148.5" stroke={INK} strokeWidth="2.3" strokeLinecap="round" />
      <path d="M 80 132 C 92 154 148 154 160 132" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="120" cy="92" r="12" fill="url(#dora-head-red)" stroke={INK} strokeWidth="2.2" />
      <ellipse cx="115.5" cy="87.5" rx="3.8" ry="2.8" fill="#ffffff" opacity="0.9" />

      {/* Bell */}
      <circle cx="120" cy="204" r="12" fill="url(#dora-head-gold)" stroke="#6f4d00" strokeWidth="1.8" />
      <path d="M 108.7 200 H 131.3" stroke="#6f4d00" strokeWidth="1.8" />
      <path d="M 109.4 196.8 H 130.6" stroke="#6f4d00" strokeWidth="1.4" opacity="0.6" />
      <circle cx="120" cy="207.5" r="2.3" fill="#4a3300" />
      <path d="M 120 209.5 V 215.5" stroke="#4a3300" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="115.6" cy="197.6" r="2.2" fill="#ffffff" opacity="0.75" />
    </svg>
  );
}
