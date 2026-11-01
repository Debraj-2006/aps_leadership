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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEvent, updateEvent } from "@/lib/actions/events";
import type { ChapterEvent } from "@/lib/types";

const EVENT_TYPES = [
  "technical_talk",
  "workshop",
  "webinar",
  "competition",
  "seminar",
  "social",
  "other",
];

export function EventFormDialog({ editing }: { editing?: ChapterEvent }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = editing ? await updateEvent(editing.id, formData) : await createEvent(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success(editing ? "Event updated." : "Event created.");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={editing ? <Button variant="ghost" size="icon" /> : <Button size="sm" />}>
        {editing ? (
          <Pencil className="size-4" />
        ) : (
          <>
            <Plus className="size-4" /> New event
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit event" : "New event"}</DialogTitle>
          <DialogDescription>
            Technical talks, workshops, webinars, competitions and other chapter activities.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={editing?.title} required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select name="type" defaultValue={editing?.type ?? "technical_talk"}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select name="status" defaultValue={editing?.status ?? "planned"}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_date">Date</Label>
            <Input id="event_date" name="event_date" type="date" defaultValue={editing?.event_date} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attendees_count">Attendees</Label>
            <Input id="attendees_count" name="attendees_count" type="number" min={0} defaultValue={editing?.attendees_count ?? 0} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input id="venue" name="venue" defaultValue={editing?.venue ?? ""} placeholder="Seminar Hall, IEM" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="speaker">Speaker / Resource person</Label>
            <Input id="speaker" name="speaker" defaultValue={editing?.speaker ?? ""} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={editing?.description ?? ""} />
          </div>
          <DialogFooter className="col-span-2">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Create event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
