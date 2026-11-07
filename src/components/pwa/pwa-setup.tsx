"use client";

import { useEffect } from "react";
import { startPwa } from "@/lib/pwa";

// Registers the service worker and listens for the browser's install offer.
export function PwaSetup() {
  useEffect(() => startPwa(), []);
  return null;
}
