"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Pin, PinOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAnnouncement, setAnnouncementPinned } from "@/lib/actions/announcements";

export function AnnouncementPinButton({ id, pinned }: { id: string; pinned: boolean }) {
  const [pending, startTransition] = useTransition();
  const label = pinned ? "Unpin from the dashboard" : "Pin to the dashboard";
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await setAnnouncementPinned(id, !pinned);
          if (result?.error) toast.error(result.error);
          else toast.success(pinned ? "Unpinned from the dashboard." : "Pinned to the dashboard.");
        })
      }
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
    </Button>
  );
}

export function DeleteAnnouncementButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Delete announcement"
      title="Delete announcement"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this announcement for everyone?")) return;
        startTransition(async () => {
          const result = await deleteAnnouncement(id);
          if (result?.error) toast.error(result.error);
          else toast.success("Announcement deleted.");
        });
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 text-destructive" />}
    </Button>
  );
}
