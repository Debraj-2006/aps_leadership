"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { UserMenu } from "@/components/layout/user-menu";
import type { Profile, Notification } from "@/lib/types";

export function AppShell({
  profile,
  notifications,
  unreadCount,
  children,
}: {
  profile: Profile;
  notifications: Notification[];
  unreadCount: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:block">
        <SidebarNav role={profile.role} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav role={profile.role} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 lg:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <p className="hidden text-sm font-medium text-muted-foreground sm:block">
              IEEE AP-S Student Branch Chapter &middot; Institute of Engineering &amp; Management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell initialNotifications={notifications} initialUnread={unreadCount} />
            <UserMenu profile={profile} />
          </div>
        </header>

        <main className="flex-1 bg-muted/30 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
