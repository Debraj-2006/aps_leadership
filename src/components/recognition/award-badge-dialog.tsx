"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Award, Loader2 } from "lucide-react";
import { cn } from "cn";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { awardBadge } from "@/lib/actions/recognition";
import { BADGES } from "@/lib/badges";
import { ROLE_LABELS } from "@/lib/roles";
import type { RecognitionEventOption, RecognitionMemberOption } from "./award-points-dialog";

export function AwardBadgeDialog({
  members,
  events,
  defaultRecipientId,
  iconOnly = false,
  recipientName,
}: {
  members: RecognitionMemberOption[];
  events: RecognitionEventOption[];
  defaultRecipientId?: string;
  iconOnly?: boolean;
  recipientName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [badge, setBadge] = useState<string>(BADGES[0].key);
  const [pending, startTransition] = useTransition();

  const memberItems = members.map((m) => ({ value: m.id, label: m.full_name || m.email }));
  const eventItems = events.map((e) => ({ value: e.id, label: e.title }));

  function handleSubmit(formData: FormData) {
    formData.set("badge", badge);
    startTransition(async () => {
      const result = await awardBadge(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Badge awarded.");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          iconOnly ? (
            <Button
              variant="ghost"
              size="icon"
              title="Award badge"
              aria-label={recipientName ? `Award a badge to ${recipientName}` : "Award badge"}
            />
          ) : (
            <Button size="sm" variant="outline" />
          )
        }
      >
        <Award className="size-4" />
        {!iconOnly && " Award badge"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Award an event badge</DialogTitle>
          <DialogDescription>
            Recognise a Core or Working Committee member for their work on a specific event.
          </DialogDescription>
        </DialogHeader>

        {members.length === 0 || events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {members.length === 0
              ? "There are no Core or Working Committee members yet."
              : "Create an event first. Badges are always given for a particular event."}
          </p>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Member</Label>
                <Select name="recipient_id" required defaultValue={defaultRecipientId} items={memberItems}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.full_name || m.email} · {ROLE_LABELS[m.role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Event</Label>
                <Select name="event_id" required items={eventItems}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select the event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Badge</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Badge">
                {BADGES.map((b) => {
                  const Icon = b.icon;
                  const selected = badge === b.key;
                  return (
                    <button
                      key={b.key}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      title={b.description}
                      onClick={() => setBadge(b.key)}
                      className={cn(
                        "flex items-center gap-2 rounded-md border p-2 text-left text-xs font-medium transition-colors",
                        selected ? "border-primary ring-2 ring-primary/30" : "hover:bg-muted"
                      )}
                    >
                      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", b.className)}>
                        <Icon className="size-3.5" />
                      </span>
                      {b.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {BADGES.find((b) => b.key === badge)?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea id="note" name="note" rows={2} placeholder="What did they do well?" />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                Award badge
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
