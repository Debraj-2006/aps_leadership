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
import { createTenure, updateTenure } from "@/lib/actions/tenure";
import type { Tenure } from "@/lib/types";

export function TenureFormDialog({ editing }: { editing?: Tenure }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = editing ? await updateTenure(editing.id, formData) : await createTenure(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success(editing ? "Tenure updated." : "Tenure created.");
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
            <Plus className="size-4" /> New tenure
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit tenure" : "New tenure"}</DialogTitle>
          <DialogDescription>
            Define the academic-year committee period, status, and highlights.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="academic_year">Academic year</Label>
              <Input
                id="academic_year"
                name="academic_year"
                placeholder="e.g. 2026-2027"
                defaultValue={editing?.academic_year}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" name="start_date" type="date" defaultValue={editing?.start_date} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End date</Label>
              <Input id="end_date" name="end_date" type="date" defaultValue={editing?.end_date} required />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Status</Label>
              <Select name="status" defaultValue={editing?.status ?? "upcoming"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="theme">Theme / focus area</Label>
              <Input id="theme" name="theme" placeholder="e.g. Innovation & Industry Collaboration" defaultValue={editing?.theme ?? ""} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="achievements">Key achievements</Label>
              <Textarea
                id="achievements"
                name="achievements"
                rows={3}
                placeholder="Notable milestones for this tenure"
                defaultValue={editing?.achievements ?? ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Create tenure"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
