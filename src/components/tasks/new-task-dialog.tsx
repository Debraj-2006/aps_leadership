"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
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
import { createTask } from "@/lib/actions/tasks";
import { ROLE_LABELS } from "@/lib/roles";
import type { UserRole } from "@/lib/types";

export function NewTaskDialog({
  members,
  events,
  myRole,
}: {
  members: { id: string; full_name: string; email: string; role: UserRole }[];
  events: { id: string; title: string; event_date: string }[];
  myRole: UserRole;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const memberItems = members.map((m) => ({ value: m.id, label: m.full_name || m.email }));
  const eventItems = [{ value: "none", label: "Not linked to an event" }, ...events.map((e) => ({ value: e.id, label: e.title }))];
  const priorityItems = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createTask(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Task assigned.");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" /> New task
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign a task</DialogTitle>
          <DialogDescription>
            {myRole === "core"
              ? "As a Core Committee member you can assign tasks to Working Committee members."
              : "Assign a task to a Core or Working Committee member."}
          </DialogDescription>
        </DialogHeader>

        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {myRole === "core"
              ? "There are no Working Committee members to assign tasks to yet."
              : "There are no Core or Working Committee members to assign tasks to yet."}
          </p>
        ) : (
          <form action={handleSubmit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Task</Label>
              <Input id="title" name="title" required placeholder="e.g. Design the workshop poster" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Assign to</Label>
              <Select name="assigned_to" required items={memberItems}>
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
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select name="priority" defaultValue="medium" items={priorityItems}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityItems.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
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
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Details (optional)</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <DialogFooter className="col-span-2">
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                Assign task
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
