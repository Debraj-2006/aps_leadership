"use client";

// Remembers the browser's "install this app" offer so a button can show it later.

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let offer: InstallPromptEvent | null = null;
let started = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

export function startPwa() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    offer = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    offer = null;
    notify();
  });
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
}

export function subscribeInstallOffer(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const getInstallOffer = () => offer;

export async function acceptInstallOffer() {
  if (!offer) return false;
  await offer.prompt();
  const { outcome } = await offer.userChoice;
  offer = null;
  notify();
  return outcome === "accepted";
}

export function isInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
