"use client";

import { cn } from "@/lib/utils";
import { useFollowEyes } from "@/components/brand/use-follow-eyes";

// Full-body, waving Doraemon with a big open smile and soft figure-style shading.
// His eyes follow the pointer; he waves every few seconds, and keeps waving on hover.

const VB = 220;
const EYES = [
  { cx: 95, cy: 62, maxX: 7, maxY: 9 },
  { cx: 125, cy: 62, maxX: 7, maxY: 9 },
];

const CSS = `
  .dora-wave .pupil { transition: transform 90ms ease-out; }
  .dora-wave .eye { transform-box: fill-box; transform-origin: center; animation: dw-blink 5.5s infinite; }
  @keyframes dw-blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.08); } }
  .dora-wave .arm { transform-box: view-box; transform-origin: 62px 196px; animation: dw-wave 6s ease-in-out infinite; }
  @keyframes dw-wave {
    0%, 60%, 100% { transform: rotate(0deg); }
    67% { transform: rotate(-16deg); } 74% { transform: rotate(8deg); }
    81% { transform: rotate(-16deg); } 88% { transform: rotate(4deg); }
  }
  .dora-wave:hover .arm { animation: dw-wave-fast 0.9s ease-in-out infinite; }
  @keyframes dw-wave-fast { 0%, 100% { transform: rotate(6deg); } 50% { transform: rotate(-18deg); } }
  .dora-wave .bob { animation: dw-bob 3s ease-in-out infinite; }
  @keyframes dw-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
  @media (prefers-reduced-motion: reduce) {
    .dora-wave .eye, .dora-wave .arm, .dora-wave .bob { animation: none; }
    .dora-wave .pupil { transition: none; }
  }
`;

export function DoraWave({ className }: { className?: string }) {
  const { svgRef, pupilRef } = useFollowEyes(EYES, VB);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 220 300"
      className={cn("dora-wave overflow-visible", className)}
      aria-hidden="true"
    >
      <style>{CSS}</style>
      <defs>
        <radialGradient id="dw-blue" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#4cc0f5" />
          <stop offset="0.6" stopColor="#1497de" />
          <stop offset="1" stopColor="#0a73b8" />
        </radialGradient>
        <radialGradient id="dw-white" cx="0.4" cy="0.3" r="0.85">
          <stop offset="0.6" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe8ef" />
        </radialGradient>
        <radialGradient id="dw-red" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#ff5a4e" />
          <stop offset="1" stopColor="#c0141a" />
        </radialGradient>
        <radialGradient id="dw-gold" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffe68a" />
          <stop offset="0.55" stopColor="#f2b51c" />
          <stop offset="1" stopColor="#b37d00" />
        </radialGradient>
        <linearGradient id="dw-mouth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e0f12" />
          <stop offset="1" stopColor="#d22a22" />
        </linearGradient>
      </defs>

      <g className="bob">
        {/* Feet and body */}
        <ellipse cx="82" cy="288" rx="27" ry="12" fill="url(#dw-white)" />
        <ellipse cx="138" cy="288" rx="27" ry="12" fill="url(#dw-white)" />
        <path
          d="M 58 200 Q 52 262 70 282 H 150 Q 168 262 162 200 Z"
          fill="url(#dw-blue)"
        />
        <circle cx="110" cy="236" r="42" fill="url(#dw-white)" />
        <path
          d="M 80 234 A 30 30 0 0 0 140 234 Z"
          fill="#ffffff"
          stroke="#9aa9b6"
          strokeWidth="1.6"
        />

        {/* Resting arm (his left) */}
        <path
          d="M 156 204 Q 178 222 184 246"
          fill="none"
          stroke="url(#dw-blue)"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <circle cx="188" cy="252" r="14" fill="url(#dw-white)" />

        {/* Waving arm (his right) */}
        <g className="arm">
          <path
            d="M 64 202 Q 40 182 32 150"
            fill="none"
            stroke="url(#dw-blue)"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <circle cx="30" cy="138" r="15" fill="url(#dw-white)" />
        </g>

        {/* Head */}
        <circle cx="110" cy="100" r="90" fill="url(#dw-blue)" />
        <ellipse cx="110" cy="120" rx="74" ry="66" fill="url(#dw-white)" />
        <ellipse
          cx="66"
          cy="40"
          rx="24"
          ry="11"
          fill="#ffffff"
          opacity="0.28"
          transform="rotate(-32 66 40)"
        />

        {/* Eyes */}
        {EYES.map((e, i) => (
          <g key={i} className="eye">
            <ellipse
              cx={e.cx}
              cy={e.cy}
              rx="16"
              ry="21"
              fill="#ffffff"
              stroke="#2a2a2e"
              strokeWidth="2"
            />
            <g ref={pupilRef(i)} className="pupil">
              <ellipse
                cx={e.cx + (i === 0 ? 4 : -4)}
                cy={e.cy + 4}
                rx="4.6"
                ry="5.6"
                fill="#16161a"
              />
              <circle
                cx={e.cx + (i === 0 ? 5.5 : -2.5)}
                cy={e.cy + 2}
                r="1.5"
                fill="#ffffff"
              />
            </g>
          </g>
        ))}

        {/* Nose */}
        <circle cx="110" cy="88" r="10.5" fill="url(#dw-red)" />
        <circle cx="106.5" cy="84.5" r="3" fill="#ffffff" opacity="0.85" />
        <path
          d="M 110 99 V 110"
          stroke="#2a2a2e"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Whiskers */}
        <g stroke="#2a2a2e" strokeWidth="2" strokeLinecap="round">
          <path d="M 84 100 L 50 92" />
          <path d="M 84 110 L 46 110" />
          <path d="M 84 120 L 50 128" />
          <path d="M 136 100 L 170 92" />
          <path d="M 136 110 L 174 110" />
          <path d="M 136 120 L 170 128" />
        </g>

        {/* Big open smile with an orange tongue */}
        <path
          d="M 60 114 Q 110 122 160 114 Q 154 182 110 186 Q 66 182 60 114 Z"
          fill="url(#dw-mouth)"
        />
        <ellipse cx="110" cy="165" rx="28" ry="17" fill="#ff8a3d" />
        <ellipse cx="102" cy="160" rx="9" ry="4" fill="#ffb27a" opacity="0.7" />

        {/* Collar and bell */}
        <path
          d="M 48 186 Q 110 206 172 186 L 170 197 Q 110 216 50 197 Z"
          fill="#c8142a"
        />
        <circle cx="110" cy="210" r="12.5" fill="url(#dw-gold)" />
        <path d="M 98.5 206 H 121.5" stroke="#7a5200" strokeWidth="1.8" />
        <circle cx="110" cy="213" r="2.4" fill="#4a3200" />
        <path d="M 110 215 V 222" stroke="#4a3200" strokeWidth="1.8" />
        <circle cx="105" cy="204" r="2.4" fill="#ffffff" opacity="0.7" />
      </g>
    </svg>
  );
}
