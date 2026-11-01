"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import { TenureCountdown } from "@/components/layout/tenure-countdown";
import { isActivePath, visibleNavGroups } from "@/components/layout/nav-config";
import { ROLE_LABELS, WORKING_HOME } from "@/lib/roles";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SidebarNav({
  profile,
  navBadges = {},
  onNavigate,
}: {
  profile: Pick<Profile, "role" | "position">;
  navBadges?: Record<string, number>;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const groups = visibleNavGroups(profile.role);
  const home = profile.role === "working" ? WORKING_HOME : "/dashboard";

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link
        href={home}
        onClick={onNavigate}
        className="mx-3 mt-5 mb-6 flex items-center gap-3 rounded-md px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <BrandMark className="size-9" />
        <span className="leading-tight">
          <span className="type-display block text-[13px] font-bold tracking-[0.02em] text-white">IEEE AP-S</span>
          <span className="block text-[11px] text-sidebar-foreground/60">IEM Student Branch</span>
        </span>
      </Link>

      <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="type-eyebrow px-3 pb-2 text-[10px] text-sidebar-foreground/40">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-md py-2 pr-3 pl-8 text-[13.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                        active
                          ? "bg-sidebar-accent text-white"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-white"
                      )}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 6 8"
                        className={cn(
                          "absolute top-1/2 left-3.5 h-2 w-1.5 -translate-y-1/2 fill-trace transition-opacity",
                          active ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <path d="M0 0L6 4L0 8Z" />
                      </svg>
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-white" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                        )}
                      />
                      {item.label}
                      {(navBadges[item.href] ?? 0) > 0 && (
                        <span
                          className="type-readout ml-auto rounded-full bg-trace px-1.5 py-0.5 text-[10px] leading-none font-semibold text-ink"
                          aria-label={`${navBadges[item.href]} waiting for review`}
                        >
                          {navBadges[item.href]}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-3">
        <TenureCountdown />
      </div>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="type-eyebrow text-[10px] text-sidebar-foreground/40">Signed in as</p>
        <p className="mt-1 truncate text-sm font-medium text-white">{ROLE_LABELS[profile.role]}</p>
        {profile.position && <p className="truncate text-xs text-sidebar-foreground/60">{profile.position}</p>}
      </div>
    </div>
  );
}
