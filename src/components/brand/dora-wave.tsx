"use client";

import { cn } from "@/lib/utils";
import { useFollowEyes } from "@/components/brand/use-follow-eyes";

// Full-body, waving Doraemon drawn as a soft-shaded vector figure.
// His eyes follow the pointer; he waves every few seconds, and keeps waving on hover.

// Coordinates are in the viewBox below; the figure is centred on x = 120.
const VB = { x: -28, y: 0, w: 296, h: 322 };
const EYES = [
  { cx: 106, cy: 70, maxX: 7, maxY: 9 },
  { cx: 134, cy: 70, maxX: 7, maxY: 9 },
];

const INK = "#13223b";
const HEAD = { cx: 120, cy: 100, rx: 96, ry: 92 };
const BODY =
  "M 58 160 C 36 196 30 252 42 284 Q 46 296 62 296 L 110 296 Q 120 287 130 296 L 178 296 Q 194 296 198 284 C 210 252 204 196 182 160 Z";
const MOUTH =
  "M 78 124 Q 120 140 162 124 C 158 164 141 184 120 184 C 99 184 82 164 78 124 Z";
const COLLAR = "M 36 170 Q 120 224 204 170";

const CSS = `
  .dora .pupil { transition: transform 90ms ease-out; }
  .dora .eye { transform-box: fill-box; transform-origin: center; animation: dora-blink 5.5s infinite; }
  @keyframes dora-blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.08); } }
  .dora .wave { transform-box: view-box; transform-origin: 64px 206px; animation: dora-wave 6s ease-in-out infinite; }
  @keyframes dora-wave {
    0%, 58%, 100% { transform: rotate(0deg); }
    65% { transform: rotate(-14deg); } 72% { transform: rotate(6deg); }
    79% { transform: rotate(-14deg); } 86% { transform: rotate(3deg); }
  }
  .dora:hover .wave { animation: dora-wave-fast 0.9s ease-in-out infinite; }
  @keyframes dora-wave-fast { 0%, 100% { transform: rotate(5deg); } 50% { transform: rotate(-16deg); } }
  @media (prefers-reduced-motion: reduce) {
    .dora .eye, .dora .wave { animation: none; }
    .dora .pupil { transition: none; }
  }
`;

export function DoraWave({ className }: { className?: string }) {
  const { svgRef, pupilRef } = useFollowEyes(EYES, VB.w);

  return (
    <svg
      ref={svgRef}
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      className={cn("dora overflow-visible", className)}
      aria-hidden="true"
    >
      <style>{CSS}</style>
      <defs>
        <radialGradient id="dora-blue" cx="0.36" cy="0.3" r="0.78">
          <stop offset="0" stopColor="#63cdf8" />
          <stop offset="0.55" stopColor="#1a9fe4" />
          <stop offset="1" stopColor="#0a6fb5" />
        </radialGradient>
        <radialGradient id="dora-white" cx="0.42" cy="0.32" r="0.8">
          <stop offset="0.55" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9e5ef" />
        </radialGradient>
        <radialGradient id="dora-red" cx="0.34" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ff7468" />
          <stop offset="0.55" stopColor="#e1222b" />
          <stop offset="1" stopColor="#a30d16" />
        </radialGradient>
        <radialGradient id="dora-gold" cx="0.34" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset="0.45" stopColor="#f6c531" />
          <stop offset="1" stopColor="#b98200" />
        </radialGradient>
        <linearGradient id="dora-collar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef3a43" />
          <stop offset="1" stopColor="#b5121f" />
        </linearGradient>
        <linearGradient id="dora-mouth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#74090f" />
          <stop offset="1" stopColor="#c81e27" />
        </linearGradient>
        <radialGradient id="dora-tongue" cx="0.45" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffab7d" />
          <stop offset="1" stopColor="#f0643c" />
        </radialGradient>
        <clipPath id="dora-head-clip">
          <ellipse cx={HEAD.cx} cy={HEAD.cy} rx={HEAD.rx} ry={HEAD.ry} />
        </clipPath>
        <clipPath id="dora-mouth-clip">
          <path d={MOUTH} />
        </clipPath>
        <clipPath id="dora-silhouette">
          <ellipse cx={HEAD.cx} cy={HEAD.cy} rx={HEAD.rx} ry={HEAD.ry} />
          <path d={BODY} />
        </clipPath>
      </defs>

      {/* Ground shadow */}
      <ellipse
        cx="120"
        cy="312"
        rx="92"
        ry="7"
        fill="#000"
        opacity="0.28"
        style={{ filter: "blur(3px)" }}
      />

      {/* Feet, peeking out from under the legs */}
      <ellipse
        cx="82"
        cy="298"
        rx="34"
        ry="14"
        fill="url(#dora-white)"
        stroke={INK}
        strokeWidth="2.6"
      />
      <ellipse
        cx="158"
        cy="298"
        rx="34"
        ry="14"
        fill="url(#dora-white)"
        stroke={INK}
        strokeWidth="2.6"
      />

      {/* Body, belly and pocket */}
      <path
        d={BODY}
        fill="url(#dora-blue)"
        stroke={INK}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <circle
        cx="120"
        cy="238"
        r="47"
        fill="url(#dora-white)"
        stroke={INK}
        strokeWidth="2.4"
      />
      <path
        d="M 89 242 A 31 31 0 0 0 151 242 Z"
        fill="#ffffff"
        stroke="#8ea3b6"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <ellipse
        cx="50"
        cy="234"
        rx="5"
        ry="16"
        fill="#ffffff"
        opacity="0.22"
        transform="rotate(10 50 234)"
      />

      {/* Collar, tucked inside the outline so it never sticks out */}
      <g clipPath="url(#dora-silhouette)">
        <path
          d={COLLAR}
          fill="none"
          stroke="url(#dora-collar)"
          strokeWidth="16"
        />
      </g>
      <path
        d={BODY}
        fill="none"
        stroke={INK}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />

      {/* Resting arm */}
      <path
        d="M 180 206 Q 204 216 216 240"
        fill="none"
        stroke={INK}
        strokeWidth="28"
        strokeLinecap="round"
      />
      <path
        d="M 180 206 Q 204 216 216 240"
        fill="none"
        stroke="#1797df"
        strokeWidth="22.5"
        strokeLinecap="round"
      />
      <circle
        cx="220"
        cy="247"
        r="16.5"
        fill="url(#dora-white)"
        stroke={INK}
        strokeWidth="2.6"
      />

      {/* Waving arm */}
      <g className="wave">
        <path
          d="M 64 206 Q 44 192 34 170"
          fill="none"
          stroke={INK}
          strokeWidth="28"
          strokeLinecap="round"
        />
        <path
          d="M 64 206 Q 44 192 34 170"
          fill="none"
          stroke="#1797df"
          strokeWidth="22.5"
          strokeLinecap="round"
        />
        <circle
          cx="26"
          cy="158"
          r="17"
          fill="url(#dora-white)"
          stroke={INK}
          strokeWidth="2.6"
        />
      </g>

      {/* Head */}
      <ellipse
        cx={HEAD.cx}
        cy={HEAD.cy}
        rx={HEAD.rx}
        ry={HEAD.ry}
        fill="url(#dora-blue)"
        stroke={INK}
        strokeWidth="3"
      />
      <g clipPath="url(#dora-head-clip)">
        <ellipse
          cx="120"
          cy="122"
          rx="84"
          ry="71"
          fill="url(#dora-white)"
          stroke={INK}
          strokeWidth="2.4"
        />
      </g>
      <ellipse
        cx="74"
        cy="38"
        rx="28"
        ry="11"
        fill="#ffffff"
        opacity="0.32"
        transform="rotate(-35 74 38)"
      />

      {/* Eyes */}
      {[101, 139].map((cx, i) => (
        <g key={cx} className="eye">
          <ellipse
            cx={cx}
            cy="66"
            rx="19"
            ry="25"
            fill="#ffffff"
            stroke={INK}
            strokeWidth="2.6"
          />
          <g ref={pupilRef(i)} className="pupil">
            <ellipse
              cx={EYES[i].cx}
              cy={EYES[i].cy}
              rx="5"
              ry="6.6"
              fill="#111318"
            />
            <circle
              cx={EYES[i].cx + 1.6}
              cy={EYES[i].cy - 2.6}
              r="1.8"
              fill="#ffffff"
            />
          </g>
        </g>
      ))}

      {/* Whiskers */}
      <g stroke={INK} strokeWidth="2.3" strokeLinecap="round">
        <path d="M 92 96 L 50 86" />
        <path d="M 90 106 L 46 105" />
        <path d="M 92 116 L 50 122" />
        <path d="M 148 96 L 190 86" />
        <path d="M 150 106 L 194 105" />
        <path d="M 148 116 L 190 122" />
      </g>

      {/* Nose and the line down to the mouth */}
      <path
        d="M 120 104 V 132"
        stroke={INK}
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <circle
        cx="120"
        cy="92"
        r="12"
        fill="url(#dora-red)"
        stroke={INK}
        strokeWidth="2.2"
      />
      <ellipse
        cx="115.5"
        cy="87.5"
        rx="3.8"
        ry="2.8"
        fill="#ffffff"
        opacity="0.9"
      />

      {/* Big open smile */}
      <path d={MOUTH} fill="url(#dora-mouth)" />
      <g clipPath="url(#dora-mouth-clip)">
        <ellipse cx="120" cy="175" rx="30" ry="15" fill="url(#dora-tongue)" />
      </g>
      <path
        d={MOUTH}
        fill="none"
        stroke={INK}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* Bell */}
      <circle
        cx="120"
        cy="210"
        r="12.5"
        fill="url(#dora-gold)"
        stroke="#6f4d00"
        strokeWidth="1.8"
      />
      <path d="M 108.2 206 H 131.8" stroke="#6f4d00" strokeWidth="1.8" />
      <path
        d="M 108.8 202.6 H 131.2"
        stroke="#6f4d00"
        strokeWidth="1.4"
        opacity="0.6"
      />
      <circle cx="120" cy="213.5" r="2.4" fill="#4a3300" />
      <path
        d="M 120 215.5 V 222"
        stroke="#4a3300"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="115.5" cy="203.5" r="2.3" fill="#ffffff" opacity="0.75" />
    </svg>
  );
}
