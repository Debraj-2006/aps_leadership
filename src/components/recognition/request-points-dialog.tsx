"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { HandHeart, Loader2 } from "lucide-react";
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
import { createPointRequest } from "@/lib/actions/point-requests";
import type { UserRole } from "@/lib/types";

const QUICK_POINTS = [5, 10, 25];

export function RequestPointsDialog({
  meId,
  members,
  events,
  myRole,
}: {
  meId: string;
  members: { id: string; full_name: string; email: string; role: UserRole }[];
  events: { id: string; title: string; event_date: string }[];
  myRole: UserRole;
}) {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState("10");
  const [pending, startTransition] = useTransition();

  const target = myRole === "working" ? "Core Committee" : "Working Committee";
  const memberItems = [
    { value: meId, label: "Myself (for my own work)" },
    ...members.map((m) => ({ value: m.id, label: `${m.full_name || m.email} · ${target}` })),
  ];
  const eventItems = [{ value: "none", label: "Not linked to an event" }, ...events.map((e) => ({ value: e.id, label: e.title }))];

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createPointRequest(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Request sent to the Executive Committee.");
        setOpen(false);
        setPoints("10");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <HandHeart className="size-4" /> Request points
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request points</DialogTitle>
          <DialogDescription>
            Ask for points for your own work, or recognise a {target} member. An Executive reviews every request, and the points are added once they approve it.
          </DialogDescription>
        </DialogHeader>

        {(
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Who are the points for?</Label>
              <Select name="recipient_id" required defaultValue={meId} items={memberItems}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {memberItems.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="request-points">Points</Label>
              <div className="flex flex-wrap items-center gap-2">
                {QUICK_POINTS.map((p) => (
                  <Button
                    key={p}
                    type="button"
                    size="sm"
                    variant={points === String(p) ? "default" : "outline"}
                    onClick={() => setPoints(String(p))}
                  >
                    {p}
                  </Button>
                ))}
                <Input
                  id="request-points"
                  name="points"
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  required
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-24"
                />
              </div>
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
              <Label htmlFor="request-reason">Reason</Label>
              <Textarea
                id="request-reason"
                name="reason"
                rows={3}
                required
                placeholder="What did they do? e.g. Stayed late to set up the lab for the workshop"
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                Send request
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
