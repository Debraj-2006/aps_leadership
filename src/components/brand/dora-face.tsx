"use client";

import { cn } from "@/lib/utils";
import { FACE_CSS, useFollowEyes } from "@/components/brand/use-follow-eyes";

// Fan-drawn Doraemon face whose eyes follow the pointer anywhere on the page.

const VB = 200;
const EYES = [
  { cx: 82, cy: 62, maxX: 8, maxY: 11 },
  { cx: 118, cy: 62, maxX: 8, maxY: 11 },
];

export function DoraFace({ className }: { className?: string }) {
  const { svgRef, pupilRef } = useFollowEyes(EYES, VB);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB} ${VB}`}
      className={cn("toon overflow-visible", className)}
      aria-hidden="true"
    >
      <style>{FACE_CSS}</style>

      {/* Head and face */}
      <circle
        cx="100"
        cy="104"
        r="93"
        fill="#0096e0"
        stroke="#0f2a47"
        strokeWidth="3"
      />
      <ellipse
        cx="100"
        cy="124"
        rx="75"
        ry="68"
        fill="#ffffff"
        stroke="#0f2a47"
        strokeWidth="3"
      />
      <ellipse
        cx="62"
        cy="40"
        rx="22"
        ry="10"
        fill="#ffffff"
        opacity="0.25"
        transform="rotate(-30 62 40)"
      />

      {/* Eyes */}
      {EYES.map((eye, i) => (
        <g key={i} className="blink">
          <ellipse
            cx={eye.cx}
            cy={eye.cy}
            rx="18"
            ry="23"
            fill="#ffffff"
            stroke="#0f2a47"
            strokeWidth="3"
          />
          <g ref={pupilRef(i)} className="pupil">
            <circle
              cx={eye.cx + (i === 0 ? 5 : -5)}
              cy={eye.cy + 4}
              r="6.5"
              fill="#0f2a47"
            />
            <circle
              cx={eye.cx + (i === 0 ? 6.5 : -3.5)}
              cy={eye.cy + 2}
              r="2"
              fill="#ffffff"
            />
          </g>
        </g>
      ))}

      {/* Nose */}
      <circle
        cx="100"
        cy="90"
        r="11"
        fill="#e5132a"
        stroke="#0f2a47"
        strokeWidth="3"
      />
      <circle cx="96" cy="86" r="3.5" fill="#ffffff" opacity="0.85" />
      <path
        d="M 100 101 V 142"
        stroke="#0f2a47"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Whiskers */}
      <g stroke="#0f2a47" strokeWidth="3" strokeLinecap="round">
        <path d="M 72 104 L 34 94" />
        <path d="M 72 114 L 30 114" />
        <path d="M 72 124 L 34 134" />
        <path d="M 128 104 L 166 94" />
        <path d="M 128 114 L 170 114" />
        <path d="M 128 124 L 166 134" />
      </g>

      {/* Mouth: a gentle smile, opening into a big grin on hover */}
      <path
        className="calm"
        d="M 58 138 Q 100 182 142 138"
        fill="none"
        stroke="#0f2a47"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <g className="grin">
        <path
          d="M 54 136 Q 100 204 146 136 Q 100 150 54 136 Z"
          fill="#d7262f"
          stroke="#0f2a47"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 74 166 Q 100 152 126 166 Q 100 184 74 166 Z"
          fill="#ff8a8f"
        />
      </g>

      {/* Collar and bell */}
      <path
        d="M 30 176 Q 100 214 170 176"
        fill="none"
        stroke="#e5132a"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <g transform="translate(100 204)">
        <circle r="13" fill="#ffcf00" stroke="#0f2a47" strokeWidth="2.5" />
        <path d="M -12 -4 H 12" stroke="#0f2a47" strokeWidth="2.5" />
        <circle cy="3" r="2.5" fill="#0f2a47" />
        <path d="M 0 5 V 12" stroke="#0f2a47" strokeWidth="2.5" />
      </g>
    </svg>
  );
}
