"use client";

import { usePathname } from "next/navigation";
import { sectionForPath } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";

// The sidebar group the current page belongs to, so the header and nav agree.
export function SectionEyebrow({ override, onDark = false }: { override?: string; onDark?: boolean }) {
  const pathname = usePathname();
  const label = override ?? sectionForPath(pathname);
  if (!label) return null;
  return <p className={cn("type-eyebrow", onDark ? "text-trace" : "text-primary")}>{label}</p>;
}
