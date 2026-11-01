// The AP-S signal at hero scale: the orange source with green, teal and blue wavefronts in
// the same proportions as the logo symbol, plus thin rings that keep propagating outward.
// The viewBox frames just the source and wavefronts; rings and glow spill past it on purpose
// (overflow is visible), so the parent decides how far they reach.
const CX = 358;
const CY = 42;

// From directly left of the source to directly below it, bulging toward the bottom-left.
function wavefront(r: number) {
  return `M ${CX - r} ${CY} A ${r} ${r} 0 0 0 ${CX} ${CY + r}`;
}

const STATIC_RINGS = [440, 550, 660, 770, 880, 990, 1100];

export function PropagationArt({ id, className }: { id: string; className?: string }) {
  const glowId = `${id}-source-glow`;
  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMaxYMid meet"
      overflow="visible"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={glowId} cx={CX} cy={CY} r="320" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffa300" stopOpacity="0.34" />
          <stop offset="0.45" stopColor="#ffa300" stopOpacity="0.08" />
          <stop offset="1" stopColor="#ffa300" stopOpacity="0" />
        </radialGradient>
      </defs>
      <style>{`
        .aps-ripple {
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0;
          animation: aps-ripple 7.5s cubic-bezier(0.2, 0.6, 0.35, 1) infinite;
        }
        .aps-ripple:nth-of-type(2) { animation-delay: 2.5s; }
        .aps-ripple:nth-of-type(3) { animation-delay: 5s; }
        @keyframes aps-ripple {
          0% { transform: scale(0.08); opacity: 0.6; }
          100% { transform: scale(1); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .aps-ripple { animation: none; display: none; }
        }
      `}</style>

      <circle cx={CX} cy={CY} r="320" fill={`url(#${glowId})`} />

      <g fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1">
        {STATIC_RINGS.map((r) => (
          <circle key={r} cx={CX} cy={CY} r={r} />
        ))}
      </g>

      <g fill="none" stroke="#2fc4cc" strokeWidth="1.5">
        <circle className="aps-ripple" cx={CX} cy={CY} r="1000" />
        <circle className="aps-ripple" cx={CX} cy={CY} r="1000" />
        <circle className="aps-ripple" cx={CX} cy={CY} r="1000" />
      </g>

      <g fill="none">
        <path d={wavefront(330)} stroke="#00629b" strokeWidth="56" />
        <path d={wavefront(222)} stroke="#009ca6" strokeWidth="46" />
        <path d={wavefront(116)} stroke="#78be20" strokeWidth="36" />
      </g>
      <circle cx={CX} cy={CY} r="31" fill="#ffa300" />
    </svg>
  );
}
