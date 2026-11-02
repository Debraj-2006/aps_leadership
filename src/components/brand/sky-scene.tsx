import { cn } from "@/lib/utils";

// A twilight town scene, inspired by evening Doraemon backdrops: starry sky, a glowing moon,
// drifting clouds, falling cherry-blossom petals, and a small-town skyline with lit windows,
// power lines and a street lamp. It fills its (relative, overflow-hidden) parent.

// Small seeded random generator so the server and browser draw the same scene.
function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = seeded(7);
const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: rand() * 1200,
  y: rand() * 420,
  r: rand() < 0.15 ? 1.8 : 0.6 + rand() * 0.8,
  twinkle: i % 4 === 0,
  delay: (rand() * 4).toFixed(2),
}));

const PETALS = Array.from({ length: 24 }, () => ({
  x: rand() * 1200,
  delay: (rand() * 12).toFixed(2),
  duration: (9 + rand() * 7).toFixed(2),
  scale: (0.7 + rand() * 0.7).toFixed(2),
  drift: Math.round(60 + rand() * 120),
}));

type House = {
  x: number;
  w: number;
  h: number;
  roof: "gable" | "hip" | "flat";
  windows: { x: number; y: number; lit: boolean }[];
};

function buildRow(
  seed: number,
  baseH: number,
  varH: number,
  minW: number,
  varW: number,
) {
  const r = seeded(seed);
  const houses: House[] = [];
  let x = -30;
  while (x < TOWN_W + 30) {
    const w = Math.round(minW + r() * varW);
    const h = Math.round(baseH + r() * varH);
    const roofPick = r();
    const roof = roofPick < 0.45 ? "gable" : roofPick < 0.85 ? "hip" : "flat";
    const windows: House["windows"] = [];
    const cols = Math.max(1, Math.floor(w / 34));
    const rows = h > 70 ? 2 : 1;
    for (let c = 0; c < cols; c++) {
      for (let k = 0; k < rows; k++) {
        if (r() < 0.75)
          windows.push({
            x: x + 12 + c * ((w - 24) / cols),
            y: 200 - h + 14 + k * 30,
            lit: r() < 0.6,
          });
      }
    }
    houses.push({ x, w, h, roof, windows });
    x += w + Math.round(r() * 14);
  }
  return houses;
}

const TOWN_W = 1600;
const FAR = buildRow(11, 70, 70, 40, 50);
const NEAR = buildRow(23, 38, 46, 70, 70);

function housePath({ x, w, h, roof }: House) {
  const top = 200 - h;
  const body = `M ${x} 200 V ${top} H ${x + w} V 200 Z`;
  if (roof === "flat")
    return `${body} M ${x - 3} ${top} H ${x + w + 3} V ${top - 6} H ${x - 3} Z`;
  if (roof === "gable")
    return `${body} M ${x - 9} ${top + 2} L ${x + w / 2} ${top - 26} L ${x + w + 9} ${top + 2} Z`;
  return `${body} M ${x - 8} ${top + 2} Q ${x + 6} ${top - 4} ${x + 14} ${top - 18} H ${x + w - 14} Q ${x + w - 6} ${top - 4} ${x + w + 8} ${top + 2} Z`;
}

const POLES = [170, 560, 1060, 1430];

/* ---------- Kawasaki, Kanagawa landmarks (all far away, in the back layer) ---------- */

// Musashi-Kosugi high-rises with a few lit windows.
const TOWERS = [
  { x: 372, top: 58, w: 30 },
  { x: 408, top: 44, w: 28 },
  { x: 440, top: 64, w: 26 },
];
const towerRand = seeded(31);
const TOWER_WINDOWS = TOWERS.flatMap((t) => {
  const out: { x: number; y: number }[] = [];
  for (let y = t.top + 10; y < 150; y += 9)
    for (let x = t.x + 5; x < t.x + t.w - 4; x += 7)
      if (towerRand() < 0.35) out.push({ x, y });
  return out;
});

// Kawasaki Daishi's five-storey pagoda: stacked tiers with upturned eaves and a spire.
function pagodaPath(cx: number, base: number) {
  let d = "";
  let y = base;
  for (let i = 0; i < 5; i++) {
    const body = 30 - i * 3;
    const roof = 66 - i * 7;
    d += `M ${cx - body / 2} ${y} V ${y - 14} H ${cx + body / 2} V ${y} Z `;
    y -= 14;
    d += `M ${cx - roof / 2} ${y - 2} Q ${cx - roof / 4} ${y + 2} ${cx - body / 2} ${y} H ${cx + body / 2} Q ${cx + roof / 4} ${y + 2} ${cx + roof / 2} ${y - 2} L ${cx + body / 2 - 2} ${y - 8} H ${cx - body / 2 + 2} Z `;
    y -= 8;
  }
  d += `M ${cx - 1.5} ${y} V ${y - 30} H ${cx + 1.5} V ${y} Z`;
  return { d, top: y - 30 };
}
const PAGODA = pagodaPath(1185, 200);

// Keihin industrial zone: chimneys, tanks and the famous factory night lights.
const CHIMNEYS = [
  { x: 1372, top: 62, w: 9 },
  { x: 1412, top: 52, w: 7 },
  { x: 1520, top: 58, w: 9 },
  { x: 1566, top: 70, w: 8 },
];
const factoryRand = seeded(57);
const FACTORY_LIGHTS = Array.from({ length: 46 }, () => ({
  x: 1350 + factoryRand() * 250,
  y: 70 + factoryRand() * 70,
  cool: factoryRand() < 0.45,
}));

const LANDMARK_CSS = `
  .kw-blink { animation: kw-blink 1.8s steps(1) infinite; }
  .kw-blink:nth-of-type(2n) { animation-delay: 0.9s; }
  @keyframes kw-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
  .kw-flame { transform-box: fill-box; transform-origin: 50% 100%; animation: kw-flame 0.5s ease-in-out infinite alternate; }
  @keyframes kw-flame { from { transform: scaleY(0.8); } to { transform: scaleY(1.15); } }
  @media (prefers-reduced-motion: reduce) { .kw-blink, .kw-flame { animation: none; } }
`;

function wire(y: number, sag: number) {
  const pts = [-20, ...POLES, TOWN_W + 20];
  let d = `M ${pts[0]} ${y}`;
  for (let i = 1; i < pts.length; i++)
    d += ` Q ${(pts[i - 1] + pts[i]) / 2} ${y + sag} ${pts[i]} ${y}`;
  return d;
}

// "back" = distant rooftops, power lines and the lamp; "front" = the nearest houses.
// Drawing them separately lets something sit between the two layers.
export function Town({
  id,
  className,
  layer = "all",
}: {
  id: string;
  className?: string;
  layer?: "all" | "back" | "front";
}) {
  const back = layer !== "front";
  const front = layer !== "back";
  const glow = `${id}-lamp-glow`;
  return (
    <svg
      viewBox={`0 0 ${TOWN_W} 200`}
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#ffd88a" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffd88a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {back && (
        <>
          <style>{LANDMARK_CSS}</style>

          {/* Mt. Fuji on the horizon, as seen from the Tama River on a clear evening */}
          <path
            d="M 360 165 Q 460 112 506 72 Q 540 64 574 72 Q 620 112 720 165 Z"
            fill="#3a63ad"
            opacity="0.85"
          />
          <path
            d="M 506 72 Q 540 64 574 72 L 592 90 L 578 86 L 566 96 L 552 84 L 538 98 L 524 85 L 510 94 L 500 86 L 488 90 Z"
            fill="#eaf2ff"
            opacity="0.9"
          />

          {/* Musashi-Kosugi towers */}
          <g fill="#1a3a7a">
            {TOWERS.map((t) => (
              <rect
                key={t.x}
                x={t.x}
                y={t.top}
                width={t.w}
                height={200 - t.top}
              />
            ))}
          </g>
          <g fill="#ffe3a0" opacity="0.6">
            {TOWER_WINDOWS.map((w, i) => (
              <rect key={i} x={w.x} y={w.y} width="3" height="4" />
            ))}
          </g>
          <g fill="#ff4d4d">
            {TOWERS.map((t) => (
              <circle
                key={t.x}
                className="kw-blink"
                cx={t.x + t.w / 2}
                cy={t.top - 2}
                r="2.4"
              />
            ))}
          </g>

          {/* Kawasaki Daishi pagoda */}
          <path d={PAGODA.d} fill="#16346f" />
          <circle cx="1185" cy={PAGODA.top} r="2.5" fill="#ffd27a" />

          {/* Factory skyline */}
          <g fill="#173570">
            <rect x="1340" y="96" width="260" height="104" />
            <path d="M 1440 96 V 74 Q 1470 62 1500 74 V 96 Z" />
            <rect x="1452" y="60" width="4" height="16" />
            {CHIMNEYS.map((c) => (
              <rect
                key={c.x}
                x={c.x}
                y={c.top}
                width={c.w}
                height={200 - c.top}
              />
            ))}
          </g>
          <g stroke="#173570" strokeWidth="2" fill="none">
            <path d="M 1380 80 H 1520 M 1380 88 H 1440" />
          </g>
          <g>
            {FACTORY_LIGHTS.map((l, i) => (
              <circle
                key={i}
                cx={l.x.toFixed(1)}
                cy={l.y.toFixed(1)}
                r="1.4"
                fill={l.cool ? "#bfefff" : "#ffd27a"}
                opacity="0.85"
              />
            ))}
          </g>
          <g fill="#ff4d4d">
            {CHIMNEYS.map((c) => (
              <circle
                key={c.x}
                className="kw-blink"
                cx={c.x + c.w / 2}
                cy={c.top - 2}
                r="2.2"
              />
            ))}
          </g>
          <path
            className="kw-flame"
            d="M 1416 50 Q 1410 40 1416 30 Q 1422 40 1416 50 Z"
            fill="#ffb347"
          />

          {/* Distant rooftops */}
          <g fill="#1d3f82">
            {FAR.map((h, i) => (
              <path key={i} d={housePath({ ...h, h: h.h + 30 })} />
            ))}
          </g>
          <g fill="#ffd27a" opacity="0.55">
            {FAR.flatMap((h, i) =>
              h.windows
                .filter((w) => w.lit)
                .map((w, j) => (
                  <rect
                    key={`${i}-${j}`}
                    x={w.x}
                    y={w.y - 30}
                    width="4"
                    height="5"
                    rx="1"
                  />
                )),
            )}
          </g>

          {/* Power lines */}
          <g stroke="#0b1d45" fill="none" strokeWidth="1.4">
            <path d={wire(52, 18)} />
            <path d={wire(62, 24)} />
          </g>
          <g fill="#0b1d45">
            {POLES.map((x) => (
              <g key={x}>
                <rect x={x - 3} y="40" width="6" height="160" />
                <rect x={x - 22} y="48" width="44" height="4" rx="1" />
                <rect x={x - 16} y="58" width="32" height="3" rx="1" />
              </g>
            ))}
          </g>

          {/* Blue Japanese address plate on the pole */}
          <g transform="translate(548 96)">
            <rect
              width="24"
              height="30"
              rx="2"
              fill="#1e5bb8"
              stroke="#ffffff"
              strokeWidth="1"
            />
            <text
              x="12"
              y="13"
              textAnchor="middle"
              fontSize="8"
              fontWeight="700"
              fill="#ffffff"
            >
              川崎市
            </text>
            <text
              x="12"
              y="22"
              textAnchor="middle"
              fontSize="4.2"
              fill="#ffffff"
              letterSpacing="0.2"
            >
              KAWASAKI
            </text>
          </g>

          {/* Street lamp */}
          <circle cx="822" cy="92" r="70" fill={`url(#${glow})`} />
          <g fill="#0b1d45">
            <rect x="808" y="92" width="4" height="108" />
            <path d="M 810 92 Q 810 80 822 80 L 826 80 L 826 84 L 822 84 Q 814 84 814 92 Z" />
          </g>
          <circle cx="824" cy="88" r="5" fill="#fff1c4" />
        </>
      )}

      {front && (
        <>
          {/* Nearby houses */}
          <rect x="-40" y="192" width={TOWN_W + 80} height="8" fill="#0b1d45" />
          <g fill="#0b1d45">
            {NEAR.map((h, i) => (
              <path key={i} d={housePath(h)} />
            ))}
          </g>
          <g>
            {NEAR.flatMap((h, i) =>
              h.windows.map((w, j) => (
                <rect
                  key={`${i}-${j}`}
                  x={w.x}
                  y={w.y}
                  width="11"
                  height="12"
                  rx="1.5"
                  fill={w.lit ? "#ffc764" : "#1a3366"}
                  opacity={w.lit ? 0.95 : 1}
                />
              )),
            )}
          </g>
        </>
      )}
    </svg>
  );
}

const PETAL_CSS = `
  .sky-petal { animation-name: sky-petal; animation-timing-function: linear; animation-iteration-count: infinite; opacity: 0; }
  @keyframes sky-petal {
    0% { transform: translate(0, -30px) rotate(0deg); opacity: 0; }
    10% { opacity: 0.9; }
    90% { opacity: 0.9; }
    100% { transform: translate(var(--drift), 640px) rotate(540deg); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) { .sky-petal { display: none; } }
`;

/** Cherry-blossom petals drifting down over whatever sits behind them. */
export function FallingPetals({
  className,
  count = 14,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <svg
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none", className)}
      aria-hidden="true"
    >
      <style>{PETAL_CSS}</style>
      {PETALS.slice(0, count).map((p, i) => (
        <g key={i} transform={`translate(${p.x.toFixed(0)} 0)`}>
          {/* The fall animates this group; the petal's own size stays on the path. */}
          <g
            className="sky-petal"
            style={{
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              ["--drift" as string]: `${p.drift}px`,
            }}
          >
            <path
              transform={`scale(${p.scale})`}
              d="M 0 0 C 6 -7 15 -3 12 5 C 10 10 3 11 0 8 C -2 5 -3 2 0 0 Z"
              fill="#f9b4cf"
            />
          </g>
        </g>
      ))}
    </svg>
  );
}

export function SkyScene({
  id,
  className,
  town = "md",
  petals = true,
  moon = true,
}: {
  id: string;
  className?: string;
  town?: "sm" | "md" | "lg" | false;
  petals?: boolean;
  moon?: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden sky-gradient",
        className,
      )}
      aria-hidden="true"
    >
      <style>{`
        .sky-twinkle { animation: sky-twinkle 3.4s ease-in-out infinite; }
        @keyframes sky-twinkle { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
        .sky-cloud { animation: sky-cloud 40s linear infinite alternate; }
        @keyframes sky-cloud { from { transform: translateX(-40px); } to { transform: translateX(40px); } }
        .sky-shoot { animation: sky-shoot 9s ease-in infinite; opacity: 0; }
        @keyframes sky-shoot {
          0%, 82% { transform: translate(0, 0); opacity: 0; }
          84% { opacity: 1; }
          94%, 100% { transform: translate(-260px, 150px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sky-twinkle, .sky-cloud, .sky-shoot { animation: none; }
        }
      `}</style>

      {/* Stars, clouds and a shooting star */}
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
      >
        <g fill="#ffffff">
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.x.toFixed(1)}
              cy={s.y.toFixed(1)}
              r={s.r.toFixed(2)}
              opacity={s.twinkle ? undefined : 0.7}
              className={s.twinkle ? "sky-twinkle" : undefined}
              style={s.twinkle ? { animationDelay: `${s.delay}s` } : undefined}
            />
          ))}
        </g>
        <g
          fill="#ffffff"
          opacity="0.13"
          className="sky-cloud"
          style={{ filter: "blur(10px)" }}
        >
          <ellipse cx="260" cy="150" rx="150" ry="26" />
          <ellipse cx="330" cy="132" rx="90" ry="24" />
          <ellipse cx="820" cy="250" rx="170" ry="22" />
          <ellipse cx="900" cy="236" rx="80" ry="20" />
        </g>
        <g className="sky-shoot">
          <path
            d="M 900 60 L 1010 0"
            stroke={`url(#${id}-shoot-tail)`}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="900" cy="60" r="2.5" fill="#ffffff" />
        </g>
        <defs>
          <linearGradient
            id={`${id}-shoot-tail`}
            x1="900"
            y1="60"
            x2="1010"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {petals && <FallingPetals className="absolute inset-0 size-full" />}

      {/* Moon */}
      {moon && (
        <div className="absolute top-[10%] right-[7%] size-14 rounded-full bg-[radial-gradient(circle_at_38%_35%,#fffbe6_0%,#ffe9a8_55%,#f5cf74_100%)] shadow-[0_0_40px_12px_rgb(255_233_168/0.35),0_0_120px_40px_rgb(255_233_168/0.15)] sm:size-20">
          <span className="absolute top-[30%] left-[55%] size-[14%] rounded-full bg-[#e9c66e]/50" />
          <span className="absolute top-[58%] left-[30%] size-[10%] rounded-full bg-[#e9c66e]/45" />
          <span className="absolute top-[22%] left-[25%] size-[8%] rounded-full bg-[#e9c66e]/40" />
        </div>
      )}

      {/* Town */}
      {town && (
        <Town
          id={id}
          className={cn(
            "absolute inset-x-0 bottom-0 w-full",
            town === "sm" && "h-14",
            town === "md" && "h-24 sm:h-28",
            town === "lg" && "h-40 sm:h-52",
          )}
        />
      )}
    </div>
  );
}
