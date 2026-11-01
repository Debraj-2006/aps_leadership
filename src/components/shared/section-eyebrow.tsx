"use client";

import { usePathname } from "next/navigation";
import { sectionForPath } from "@/components/layout/nav-config";

// The sidebar group the current page belongs to, so the header and nav agree.
export function SectionEyebrow({ override }: { override?: string }) {
  const pathname = usePathname();
  const label = override ?? sectionForPath(pathname);
  if (!label) return null;
  return <p className="type-eyebrow text-primary">{label}</p>;
}
