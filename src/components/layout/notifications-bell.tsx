"use client";

import { useState, useTransition } from "react";
import { Bell, CalendarClock, CheckCheck, Info, ShieldCheck, ArrowLeftRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notifications";
import type { Notification } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_ICON = {
  deadline: CalendarClock,
  approval: ShieldCheck,
  handover: ArrowLeftRight,
  info: Info,
};

export function NotificationsBell({
  initialNotifications,
  initialUnread,
}: {
  initialNotifications: Notification[];
  initialUnread: number;
}) {
  const [items, setItems] = useState(initialNotifications);
  const [unread, setUnread] = useState(initialUnread);
  const [, startTransition] = useTransition();

  function handleOpenItem(n: Notification) {
    if (!n.is_read) {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, is_read: true } : i)));
      setUnread((c) => Math.max(0, c - 1));
      startTransition(() => markNotificationRead(n.id));
    }
  }

  function handleMarkAll() {
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
    setUnread(0);
    startTransition(() => markAllNotificationsRead());
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleMarkAll}>
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        </div>
        <ScrollArea className="max-h-80">
          {items.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            items.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Info;
              return (
                <button
                  key={n.id}
                  onClick={() => handleOpenItem(n)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60 last:border-b-0",
                    !n.is_read && "bg-primary/5"
                  )}
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-3.5 text-primary" />
                  </span>
                  <span className="flex-1 space-y-0.5">
                    <span className="flex items-center gap-2 font-medium">
                      {n.title}
                      {!n.is_read && <Badge className="h-1.5 w-1.5 rounded-full p-0" />}
                    </span>
                    {n.message && (
                      <span className="block text-xs text-muted-foreground">{n.message}</span>
                    )}
                    <span className="block text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
