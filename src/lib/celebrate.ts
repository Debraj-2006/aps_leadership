// A burst of dorayaki and confetti in Doraemon's colours, for points and badges.
// Browser only; does nothing for people who prefer reduced motion.

const COLORS = ["#0096e0", "#e5132a", "#ffcf00", "#f9b4cf", "#ffffff", "#5fbf3a"];

const DORAYAKI = `<svg viewBox="0 0 40 28" width="100%" height="100%" aria-hidden="true">
  <path d="M3 15 Q3 25 20 25 Q37 25 37 15 Z" fill="#f2b75b" stroke="#13223b" stroke-width="1.6"/>
  <path d="M3 13 Q20 18 37 13 L37 16 Q20 21 3 16 Z" fill="#5b2a14"/>
  <path d="M2 13 Q2 3 20 3 Q38 3 38 13 Q20 18 2 13 Z" fill="#d98b32" stroke="#13223b" stroke-width="1.6"/>
</svg>`;

export function celebrate({ count = 36, origin }: { count?: number; origin?: { x: number; y: number } } = {}) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(layer);

  const x0 = origin?.x ?? window.innerWidth / 2;
  const y0 = origin?.y ?? window.innerHeight * 0.75;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    const isTreat = i % 5 === 0;
    const size = isTreat ? 26 + Math.random() * 12 : 7 + Math.random() * 6;
    piece.style.cssText = `position:absolute;left:${x0 - size / 2}px;top:${y0 - size / 2}px;width:${size}px;height:${
      isTreat ? size * 0.7 : size * 0.45
    }px;border-radius:${isTreat ? 0 : 2}px;will-change:transform,opacity`;
    if (isTreat) piece.innerHTML = DORAYAKI;
    else piece.style.background = COLORS[i % COLORS.length];
    layer.appendChild(piece);

    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
    const power = 260 + Math.random() * 320;
    const dx = Math.cos(angle) * power;
    const dy = Math.sin(angle) * power;
    const spin = (Math.random() - 0.5) * 900;
    piece.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx * 1.25}px, ${dy + 420}px) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: 1500 + Math.random() * 900, easing: "cubic-bezier(0.2, 0.7, 0.4, 1)", fill: "forwards" }
    );
  }
  window.setTimeout(() => layer.remove(), 2600);
}
