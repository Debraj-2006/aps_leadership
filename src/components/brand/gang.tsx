"use client";

import { cn } from "@/lib/utils";
import {
  FACE_CSS,
  useFollowEyes,
  type Eye,
} from "@/components/brand/use-follow-eyes";

// Fan-drawn busts of Doraemon's friends. Like Doraemon, their eyes follow the pointer,
// they blink now and then, and they grin when hovered.

const VB = 200;
const INK = "#0f2a47";
const SKIN = "#ffdcbc";

function Toon({
  eyes,
  className,
  blinkDelay = 0,
  label,
  children,
}: {
  eyes: Eye[];
  className?: string;
  blinkDelay?: number;
  label: string;
  children: (
    pupilRef: (i: number) => (el: SVGGElement | null) => void,
  ) => React.ReactNode;
}) {
  const { svgRef, pupilRef } = useFollowEyes(eyes, VB);
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 220"
      className={cn("toon overflow-visible", className)}
      style={{ ["--blink-delay" as string]: `${blinkDelay}s` }}
      aria-hidden="true"
      data-character={label}
    >
      <style>
        {FACE_CSS + ".toon .blink { animation-delay: var(--blink-delay); }"}
      </style>
      {children(pupilRef)}
    </svg>
  );
}

function Pupil({
  pupilRef,
  cx,
  cy,
  r,
  fill = INK,
}: {
  pupilRef: (el: SVGGElement | null) => void;
  cx: number;
  cy: number;
  r: number;
  fill?: string;
}) {
  return (
    <g ref={pupilRef} className="pupil">
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle
        cx={cx + r * 0.35}
        cy={cy - r * 0.4}
        r={r * 0.32}
        fill="#ffffff"
      />
    </g>
  );
}

/* ---------- Nobita: round glasses, black fringe, yellow shirt ---------- */
const NOBITA_EYES: Eye[] = [
  { cx: 80, cy: 104, maxX: 8, maxY: 8 },
  { cx: 120, cy: 104, maxX: 8, maxY: 8 },
];
export function Nobita({ className }: { className?: string }) {
  return (
    <Toon
      eyes={NOBITA_EYES}
      className={className}
      blinkDelay={1.2}
      label="Nobita"
    >
      {(pupilRef) => (
        <>
          <path
            d="M 28 222 Q 34 172 100 166 Q 166 172 172 222 Z"
            fill="#ffd400"
            stroke={INK}
            strokeWidth="3"
          />
          <path
            d="M 76 168 L 100 190 L 124 168 Q 100 176 76 168 Z"
            fill="#fff3a0"
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <rect x="88" y="150" width="24" height="22" fill={SKIN} />
          <circle
            cx="38"
            cy="108"
            r="12"
            fill={SKIN}
            stroke={INK}
            strokeWidth="3"
          />
          <circle
            cx="162"
            cy="108"
            r="12"
            fill={SKIN}
            stroke={INK}
            strokeWidth="3"
          />
          <ellipse
            cx="100"
            cy="104"
            rx="62"
            ry="62"
            fill={SKIN}
            stroke={INK}
            strokeWidth="3"
          />
          <path
            d="M 38 100 Q 34 40 100 36 Q 166 40 162 100 Q 156 74 138 66 L 130 78 L 118 62 L 106 78 L 96 62 L 84 78 L 74 64 L 66 76 Q 46 80 38 100 Z"
            fill="#1b1b1f"
          />
          {NOBITA_EYES.map((e, i) => (
            <g key={i} className="blink">
              <circle
                cx={e.cx}
                cy={e.cy}
                r="17"
                fill="#ffffff"
                stroke={INK}
                strokeWidth="3.5"
              />
              <Pupil pupilRef={pupilRef(i)} cx={e.cx} cy={e.cy} r={4.5} />
            </g>
          ))}
          <path
            d="M 97 101 Q 100 98 103 101"
            fill="none"
            stroke={INK}
            strokeWidth="3"
          />
          <path
            d="M 98 120 Q 101 124 97 127"
            fill="none"
            stroke={INK}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            className="calm"
            d="M 84 138 Q 100 150 116 138"
            fill="none"
            stroke={INK}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            className="grin"
            d="M 80 134 Q 100 162 120 134 Q 100 140 80 134 Z"
            fill="#d7262f"
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </>
      )}
    </Toon>
  );
}

/* ---------- Shizuka: low pigtails, big eyes, pink top ---------- */
const SHIZUKA_EYES: Eye[] = [
  { cx: 80, cy: 106, maxX: 6, maxY: 7 },
  { cx: 120, cy: 106, maxX: 6, maxY: 7 },
];
export function Shizuka({ className }: { className?: string }) {
  return (
    <Toon
      eyes={SHIZUKA_EYES}
      className={className}
      blinkDelay={2.6}
      label="Shizuka"
    >
      {(pupilRef) => (
        <>
          <path
            d="M 32 222 Q 38 174 100 168 Q 162 174 168 222 Z"
            fill="#f78fb3"
            stroke={INK}
            strokeWidth="3"
          />
          <path
            d="M 80 170 Q 100 186 120 170"
            fill="none"
            stroke="#ffffff"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <rect x="89" y="150" width="22" height="22" fill={SKIN} />
          {/* Pigtails */}
          <ellipse
            cx="34"
            cy="150"
            rx="16"
            ry="28"
            fill="#2b1a12"
            stroke={INK}
            strokeWidth="3"
            transform="rotate(12 34 150)"
          />
          <ellipse
            cx="166"
            cy="150"
            rx="16"
            ry="28"
            fill="#2b1a12"
            stroke={INK}
            strokeWidth="3"
            transform="rotate(-12 166 150)"
          />
          <rect
            x="30"
            y="118"
            width="16"
            height="9"
            rx="4"
            fill="#ff5c93"
            stroke={INK}
            strokeWidth="2.5"
          />
          <rect
            x="154"
            y="118"
            width="16"
            height="9"
            rx="4"
            fill="#ff5c93"
            stroke={INK}
            strokeWidth="2.5"
          />
          <ellipse
            cx="100"
            cy="106"
            rx="58"
            ry="60"
            fill={SKIN}
            stroke={INK}
            strokeWidth="3"
          />
          <path
            d="M 40 112 Q 34 42 100 38 Q 166 42 160 112 Q 152 78 132 70 Q 116 84 100 72 Q 84 84 68 70 Q 48 78 40 112 Z"
            fill="#2b1a12"
          />
          {SHIZUKA_EYES.map((e, i) => (
            <g key={i} className="blink">
              <ellipse
                cx={e.cx}
                cy={e.cy}
                rx="11"
                ry="14"
                fill="#ffffff"
                stroke={INK}
                strokeWidth="3"
              />
              <Pupil
                pupilRef={pupilRef(i)}
                cx={e.cx}
                cy={e.cy + 1}
                r={6}
                fill="#3a2115"
              />
              <path
                d={i === 0 ? "M 69 96 L 64 92" : "M 131 96 L 136 92"}
                stroke={INK}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          ))}
          <ellipse
            cx="68"
            cy="128"
            rx="9"
            ry="5"
            fill="#ff8fb0"
            opacity="0.55"
          />
          <ellipse
            cx="132"
            cy="128"
            rx="9"
            ry="5"
            fill="#ff8fb0"
            opacity="0.55"
          />
          <path
            className="calm"
            d="M 90 138 Q 100 146 110 138"
            fill="none"
            stroke={INK}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            className="grin"
            d="M 86 135 Q 100 156 114 135 Q 100 140 86 135 Z"
            fill="#d7262f"
            stroke={INK}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </>
      )}
    </Toon>
  );
}

/* ---------- Gian: big build, short hair, orange shirt ---------- */
const GIAN_EYES: Eye[] = [
  { cx: 76, cy: 98, maxX: 3.5, maxY: 4 },
  { cx: 124, cy: 98, maxX: 3.5, maxY: 4 },
];
export function Gian({ className }: { className?: string }) {
  return (
    <Toon eyes={GIAN_EYES} className={className} blinkDelay={3.7} label="Gian">
      {(pupilRef) => (
        <>
          <path
            d="M 4 222 Q 12 160 100 156 Q 188 160 196 222 Z"
            fill="#f08a24"
            stroke={INK}
            strokeWidth="3"
          />
          <path
            d="M 74 158 L 100 180 L 126 158"
            fill="none"
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <rect x="84" y="146" width="32" height="20" fill="#f2c49b" />
          <circle
            cx="26"
            cy="104"
            r="12"
            fill="#f2c49b"
            stroke={INK}
            strokeWidth="3"
          />
          <circle
            cx="174"
            cy="104"
            r="12"
            fill="#f2c49b"
            stroke={INK}
            strokeWidth="3"
          />
          <ellipse
            cx="100"
            cy="102"
            rx="74"
            ry="64"
            fill="#f2c49b"
            stroke={INK}
            strokeWidth="3"
          />
          <path
            d="M 30 88 Q 34 38 100 36 Q 166 38 170 88 Q 158 62 100 58 Q 42 62 30 88 Z"
            fill="#1b1b1f"
          />
          <path
            d="M 60 84 L 90 88"
            stroke={INK}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 140 84 L 110 88"
            stroke={INK}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {GIAN_EYES.map((e, i) => (
            <g key={i} className="blink">
              <ellipse
                cx={e.cx}
                cy={e.cy}
                rx="9"
                ry="9"
                fill="#ffffff"
                stroke={INK}
                strokeWidth="3"
              />
              <Pupil pupilRef={pupilRef(i)} cx={e.cx} cy={e.cy} r={4} />
            </g>
          ))}
          <ellipse cx="100" cy="114" rx="7" ry="5" fill="#e3a77d" />
          <path
            className="calm"
            d="M 70 132 Q 100 150 130 132"
            fill="none"
            stroke={INK}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <g className="grin">
            <path
              d="M 62 128 Q 100 168 138 128 Q 100 138 62 128 Z"
              fill="#c0392b"
              stroke={INK}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M 72 131 Q 100 138 128 131 L 126 137 Q 100 143 74 137 Z"
              fill="#ffffff"
            />
          </g>
        </>
      )}
    </Toon>
  );
}

/* ---------- Suneo: swept spiky hair, smirk, teal shirt ---------- */
const SUNEO_EYES: Eye[] = [
  { cx: 84, cy: 102, maxX: 4.5, maxY: 5 },
  { cx: 120, cy: 102, maxX: 4.5, maxY: 5 },
];
export function Suneo({ className }: { className?: string }) {
  return (
    <Toon
      eyes={SUNEO_EYES}
      className={className}
      blinkDelay={0.6}
      label="Suneo"
    >
      {(pupilRef) => (
        <>
          <path
            d="M 34 222 Q 40 174 100 168 Q 160 174 166 222 Z"
            fill="#36a7a0"
            stroke={INK}
            strokeWidth="3"
          />
          <path
            d="M 80 170 L 100 186 L 120 170"
            fill="none"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <rect x="90" y="150" width="20" height="22" fill={SKIN} />
          <circle
            cx="44"
            cy="108"
            r="11"
            fill={SKIN}
            stroke={INK}
            strokeWidth="3"
          />
          <circle
            cx="158"
            cy="108"
            r="11"
            fill={SKIN}
            stroke={INK}
            strokeWidth="3"
          />
          <ellipse
            cx="100"
            cy="106"
            rx="56"
            ry="62"
            fill={SKIN}
            stroke={INK}
            strokeWidth="3"
          />
          <path
            d="M 44 104 Q 36 50 88 38 L 120 12 L 120 36 L 168 24 L 150 52 L 184 58 L 156 76 L 170 96 Q 150 70 120 66 Q 92 64 72 74 Q 52 84 44 104 Z"
            fill="#1b1b1f"
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {SUNEO_EYES.map((e, i) => (
            <g key={i} className="blink">
              <ellipse
                cx={e.cx}
                cy={e.cy}
                rx="9"
                ry="11"
                fill="#ffffff"
                stroke={INK}
                strokeWidth="3"
              />
              <Pupil pupilRef={pupilRef(i)} cx={e.cx} cy={e.cy + 1} r={4.5} />
            </g>
          ))}
          <path
            d="M 102 112 Q 112 120 104 126"
            fill="none"
            stroke={INK}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            className="calm"
            d="M 86 140 Q 104 148 120 134"
            fill="none"
            stroke={INK}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            className="grin"
            d="M 82 136 Q 104 160 124 132 Q 104 142 82 136 Z"
            fill="#d7262f"
            stroke={INK}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </>
      )}
    </Toon>
  );
}
