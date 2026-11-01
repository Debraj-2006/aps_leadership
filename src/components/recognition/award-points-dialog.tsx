"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { awardPoints } from "@/lib/actions/recognition";
import { ROLE_LABELS } from "@/lib/roles";
import type { UserRole } from "@/lib/types";

const QUICK_POINTS = [5, 10, 25, 50];

export interface RecognitionMemberOption {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface RecognitionEventOption {
  id: string;
  title: string;
  event_date: string;
}

export function AwardPointsDialog({
  members,
  events,
  defaultRecipientId,
  iconOnly = false,
  canAwardAnyone = false,
  recipientName,
}: {
  members: RecognitionMemberOption[];
  events: RecognitionEventOption[];
  defaultRecipientId?: string;
  iconOnly?: boolean;
  canAwardAnyone?: boolean;
  recipientName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState("10");
  const [pending, startTransition] = useTransition();

  const memberItems = members.map((m) => ({ value: m.id, label: m.full_name || m.email }));
  const eventItems = [{ value: "none", label: "Not linked to an event" }, ...events.map((e) => ({ value: e.id, label: e.title }))];

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await awardPoints(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success(Number(points) > 0 ? "Points awarded." : "Points deducted.");
        setOpen(false);
        setPoints("10");
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
              title="Give points"
              aria-label={recipientName ? `Give points to ${recipientName}` : "Give points"}
            />
          ) : (
            <Button size="sm" />
          )
        }
      >
        <Sparkles className="size-4" />
        {!iconOnly && " Give points"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Give points</DialogTitle>
          <DialogDescription>
            {canAwardAnyone
              ? "You can give points to anyone, including Executive Committee members. They get a notification straight away."
              : "Reward a Core or Working Committee member. They get a notification and see it on My points & badges."}
          </DialogDescription>
        </DialogHeader>

        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            There are no Core or Working Committee members yet.
          </p>
        ) : (
          <form action={handleSubmit} className="space-y-4">
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
              <Label htmlFor="points">Points</Label>
              <div className="flex flex-wrap items-center gap-2">
                {QUICK_POINTS.map((p) => (
                  <Button
                    key={p}
                    type="button"
                    size="sm"
                    variant={points === String(p) ? "default" : "outline"}
                    onClick={() => setPoints(String(p))}
                  >
                    +{p}
                  </Button>
                ))}
                <Input
                  id="points"
                  name="points"
                  type="number"
                  min={-100}
                  max={100}
                  step={1}
                  required
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-24"
                />
              </div>
              <p className="text-xs text-muted-foreground">Use a negative number to deduct points (−100 to 100).</p>
            </div>

            <div className="space-y-2">
              <Label>Event (optional)</Label>
              <Select name="event_id" defaultValue="none" items={eventItems}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventItems.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                name="reason"
                rows={2}
                required
                placeholder="e.g. Managed registrations for the RF workshop"
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                Give points
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
