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

const PETALS = Array.from({ length: 14 }, () => ({
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
        .sky-petal { animation-name: sky-petal; animation-timing-function: linear; animation-iteration-count: infinite; opacity: 0; }
        @keyframes sky-petal {
          0% { transform: translate(0, -30px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translate(var(--drift), 640px) rotate(540deg); opacity: 0; }
        }
        .sky-shoot { animation: sky-shoot 9s ease-in infinite; opacity: 0; }
        @keyframes sky-shoot {
          0%, 82% { transform: translate(0, 0); opacity: 0; }
          84% { opacity: 1; }
          94%, 100% { transform: translate(-260px, 150px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sky-twinkle, .sky-cloud, .sky-shoot { animation: none; }
          .sky-petal { display: none; }
        }
      `}</style>

      {/* Stars, clouds, shooting star, petals */}
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
        {petals &&
          PETALS.map((p, i) => (
            <g key={i} transform={`translate(${p.x.toFixed(0)} 0)`}>
              <path
                className="sky-petal"
                style={{
                  animationDuration: `${p.duration}s`,
                  animationDelay: `${p.delay}s`,
                  ["--drift" as string]: `${p.drift}px`,
                }}
                transform={`scale(${p.scale})`}
                d="M 0 0 C 6 -7 15 -3 12 5 C 10 10 3 11 0 8 C -2 5 -3 2 0 0 Z"
                fill="#f9b4cf"
              />
            </g>
          ))}
      </svg>

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
