"use client";

import { usePathname } from "next/navigation";
import { Gadget, type GadgetName } from "@/components/brand/gadgets";
import { cn } from "@/lib/utils";

// Which gadget from Doraemon's pocket belongs to each section of the hub.
const GADGET_FOR_PATH: [string, GadgetName][] = [
  ["/events", "door"],
  ["/documents", "pocket"],
  ["/leadership", "bell"],
  ["/handover", "clock"],
  ["/tasks", "copter"],
  ["/leaderboard", "trophy"],
  ["/recognition", "dorayaki"],
  ["/my-recognition", "dorayaki"],
  ["/members", "pipes"],
  ["/voting", "ballot"],
  ["/admin/users", "stamp"],
  ["/admin/activity", "tv"],
  ["/announcements", "megaphone"],
  ["/profile", "camera"],
];

export function gadgetForPath(pathname: string): GadgetName | null {
  const match = GADGET_FOR_PATH.find(([path]) => pathname === path || pathname.startsWith(`${path}/`));
  return match ? match[1] : null;
}

/** The current page's gadget, floating gently with a soft glow behind it. */
export function PageGadget({ className }: { className?: string }) {
  const name = gadgetForPath(usePathname());
  if (!name) return null;
  return (
    <div className={cn("gadget-float aspect-square", className)} aria-hidden="true">
      <div className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgb(255_236_170/0.32),transparent_62%)]" />
      <Gadget name={name} className="relative size-full drop-shadow-[0_10px_12px_rgb(0_0_0/0.35)]" />
    </div>
  );
}
