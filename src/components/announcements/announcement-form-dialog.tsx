"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncement, updateAnnouncement, type Announcement } from "@/lib/actions/announcements";

export function AnnouncementFormDialog({ editing }: { editing?: Announcement }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const idPrefix = editing ? `announcement-${editing.id}` : "announcement-new";

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = editing ? await updateAnnouncement(editing.id, formData) : await createAnnouncement(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success(editing ? "Announcement updated." : "Announcement posted. Everyone has been notified.");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {editing ? (
        <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Edit announcement" />}>
          <Pencil className="size-4" />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="sm" />}>
          <Plus className="size-4" /> New announcement
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit announcement" : "New announcement"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Changes show for everyone straight away. Members aren't notified again."
              : "Everyone in the hub gets a notification when you post."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-title`}>Title</Label>
            <Input
              id={`${idPrefix}-title`}
              name="title"
              required
              minLength={3}
              maxLength={120}
              defaultValue={editing?.title}
              placeholder="e.g. Core committee meeting on Friday"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-body`}>Message</Label>
            <Textarea
              id={`${idPrefix}-body`}
              name="body"
              required
              rows={6}
              maxLength={2000}
              defaultValue={editing?.body}
              placeholder="What do members need to know? Add the time, place and anything to bring."
            />
          </div>
          <label className="flex items-start gap-2.5 text-sm">
            {/* Keyed so the box resets if the pin changes while this form is open. */}
            <Checkbox
              key={String(editing?.is_pinned ?? true)}
              name="is_pinned"
              defaultChecked={editing ? editing.is_pinned : true}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">Pin to the dashboard</span>
              <span className="block text-muted-foreground">
                Pinned announcements show at the top of everyone&apos;s home page.
              </span>
            </span>
          </label>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Post announcement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
