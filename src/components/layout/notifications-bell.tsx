"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CalendarClock, CheckCheck, Info, ShieldCheck, ArrowLeftRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialNotifications);
  const [unread, setUnread] = useState(initialUnread);
  const [, startTransition] = useTransition();

  function handleOpenItem(n: Notification) {
    if (!n.is_read) {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, is_read: true } : i)));
      setUnread((c) => Math.max(0, c - 1));
      startTransition(() => markNotificationRead(n.id));
    }
    if (n.link) {
      setOpen(false);
      router.push(n.link);
    }
  }

  function handleMarkAll() {
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
    setUnread(0);
    startTransition(() => markAllNotificationsRead());
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
          />
        }
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="type-readout absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-white ring-2 ring-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleMarkAll}>
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          ) : (
            items.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Info;
              return (
                <button
                  key={n.id}
                  onClick={() => handleOpenItem(n)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-muted/70 focus-visible:bg-muted/70 focus-visible:outline-none",
                    !n.is_read && "bg-primary/[0.05]"
                  )}
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-3.5 text-primary" />
                  </span>
                  <span className="min-w-0 flex-1 space-y-0.5">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="truncate">{n.title}</span>
                      {!n.is_read && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                    </span>
                    {n.message && <span className="block text-xs text-muted-foreground">{n.message}</span>}
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
