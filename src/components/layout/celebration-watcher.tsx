"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { celebrate } from "@/lib/celebrate";
import type { Notification } from "@/lib/types";

const STORAGE_KEY = "aps-celebrated";
const WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function readCelebrated(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// Plays a celebration the first time a member opens the hub after earning points or a badge.
export function CelebrationWatcher({ notifications }: { notifications: Notification[] }) {
  useEffect(() => {
    const seen = new Set(readCelebrated());
    const fresh = notifications.filter(
      (n) =>
        !n.is_read &&
        n.title.startsWith("You earned") &&
        Date.now() - new Date(n.created_at).getTime() < WINDOW_MS &&
        !seen.has(n.id)
    );
    if (fresh.length === 0) return;

    const timer = window.setTimeout(() => {
      celebrate({ count: 48 });
      toast.success(fresh.length === 1 ? fresh[0].title : `${fresh[0].title}, and ${fresh.length - 1} more`, {
        description: fresh[0].message ?? undefined,
      });
      try {
        const keep = [...seen, ...fresh.map((n) => n.id)].slice(-100);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keep));
      } catch {
        // Private browsing: celebrate anyway; it may simply repeat next time.
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [notifications]);

  return null;
}
