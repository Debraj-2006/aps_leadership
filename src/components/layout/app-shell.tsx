"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand/brand-mark";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { TenureCountdown } from "@/components/layout/tenure-countdown";
import { WORKING_HOME } from "@/lib/roles";
import type { Profile, Notification } from "@/lib/types";

export function AppShell({
  profile,
  notifications,
  unreadCount,
  navBadges = {},
  children,
}: {
  profile: Profile;
  notifications: Notification[];
  unreadCount: number;
  navBadges?: Record<string, number>;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        <SidebarNav profile={profile} navBadges={navBadges} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-0 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav profile={profile} navBadges={navBadges} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </Button>
            <Link
              href={profile.role === "working" ? WORKING_HOME : "/dashboard"}
              className="flex items-center gap-2 rounded-md lg:hidden"
            >
              <BrandMark className="size-7" />
              <span className="type-display text-xs font-bold tracking-[0.02em] whitespace-nowrap max-sm:hidden">IEEE AP-S</span>
            </Link>
            <p className="hidden truncate text-[13px] text-muted-foreground lg:block">
              IEEE AP-S Student Branch Chapter · Institute of Engineering &amp; Management
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <TenureCountdown variant="compact" className="lg:hidden" />
            <ThemeToggle />
            <NotificationsBell initialNotifications={notifications} initialUnread={unreadCount} />
            <UserMenu profile={profile} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
