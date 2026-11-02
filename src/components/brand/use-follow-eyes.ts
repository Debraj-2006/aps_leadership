"use client";

import { useEffect, useRef } from "react";

// Shared pointer tracking for the cartoon characters: one set of window listeners for
// every face on the page, and pupils are moved directly on the DOM (no re-renders).

export type Eye = { cx: number; cy: number; maxX: number; maxY: number };

type Subscriber = (pointer: { x: number; y: number } | null) => void;
const subscribers = new Set<Subscriber>();
let pointer: { x: number; y: number } | null = null;
let frame = 0;
let listening = false;

function flush() {
  frame = 0;
  subscribers.forEach((fn) => fn(pointer));
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(flush);
}
function onMove(e: PointerEvent) {
  pointer = { x: e.clientX, y: e.clientY };
  schedule();
}
function onLeave() {
  pointer = null;
  schedule();
}

function start() {
  if (listening) return;
  listening = true;
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onMove, { passive: true });
  window.addEventListener("scroll", schedule, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
}
function stop() {
  if (!listening || subscribers.size > 0) return;
  listening = false;
  cancelAnimationFrame(frame);
  frame = 0;
  window.removeEventListener("pointermove", onMove);
  window.removeEventListener("pointerdown", onMove);
  window.removeEventListener("scroll", schedule);
  document.documentElement.removeEventListener("pointerleave", onLeave);
}

/** Returns a ref for the <svg> and a ref setter for each pupil group, in the same order as `eyes`. */
export function useFollowEyes(eyes: Eye[], viewBoxWidth: number) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pupils = useRef<(SVGGElement | null)[]>([]);
  const eyesRef = useRef(eyes);

  useEffect(() => {
    const update: Subscriber = (p) => {
      const svg = svgRef.current;
      if (!svg) return;
      const box = svg.getBoundingClientRect();
      const scale = box.width / viewBoxWidth;
      eyesRef.current.forEach((eye, i) => {
        const pupil = pupils.current[i];
        if (!pupil) return;
        if (!p) {
          pupil.style.transform = "translate(0px, 0px)";
          return;
        }
        const dx = p.x - (box.left + eye.cx * scale);
        const dy = p.y - (box.top + eye.cy * scale);
        const dist = Math.hypot(dx, dy) || 1;
        // Look fully sideways once the pointer is a little way off, less when it's close.
        const reach = Math.min(1, dist / (60 * scale + 40));
        pupil.style.transform = `translate(${((dx / dist) * eye.maxX * reach).toFixed(2)}px, ${((dy / dist) * eye.maxY * reach).toFixed(2)}px)`;
      });
    };
    subscribers.add(update);
    start();
    return () => {
      subscribers.delete(update);
      stop();
    };
  }, [viewBoxWidth]);

  const pupilRef = (i: number) => (el: SVGGElement | null) => {
    pupils.current[i] = el;
  };

  return { svgRef, pupilRef };
}

/** Shared CSS for character faces: smooth pupils and an occasional blink. */
export const FACE_CSS = `
  .toon .pupil { transition: transform 90ms ease-out; }
  .toon .blink { transform-box: fill-box; transform-origin: center; animation: toon-blink 5.5s infinite; }
  @keyframes toon-blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.08); } }
  .toon .grin { opacity: 0; transition: opacity 150ms; }
  .toon .calm { transition: opacity 150ms; }
  .toon:hover .grin { opacity: 1; }
  .toon:hover .calm { opacity: 0; }
  @media (prefers-reduced-motion: reduce) {
    .toon .blink { animation: none; }
    .toon .pupil { transition: none; }
  }
`;
