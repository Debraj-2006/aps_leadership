"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio } from "lucide-react";
import { visibleNavItems } from "@/components/layout/nav-config";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SidebarNav({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = visibleNavItems(role);

  return (
    <div className="flex h-full flex-col text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary/20">
          <Radio className="size-5 text-sidebar-primary" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">IEEE AP-S</p>
          <p className="text-[11px] text-sidebar-foreground/60">IEM Student Branch</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 text-[11px] text-sidebar-foreground/50">
        Transition Hub v1.0
      </div>
    </div>
  );
}
