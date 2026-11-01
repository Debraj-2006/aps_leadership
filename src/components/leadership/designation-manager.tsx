"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ListTree, Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createDesignation } from "@/lib/actions/leadership";
import type { Designation } from "@/lib/types";

export function DesignationManager({ designations }: { designations: Designation[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const title = String(formData.get("title") || "").trim();
    const rank = Number(formData.get("rank") || 100);
    if (!title) return;

    startTransition(async () => {
      const result = await createDesignation(title, rank);
      if (result?.error) toast.error(result.error);
      else toast.success("Designation added.");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <ListTree className="size-4" /> Designations
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Designations</DialogTitle>
          <DialogDescription>
            Define the executive positions available across all tenures.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {designations.map((d) => (
            <Badge key={d.id} variant="secondary">
              {d.title}
            </Badge>
          ))}
        </div>

        <form action={handleSubmit} className="flex items-end gap-2 pt-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="title">New designation</Label>
            <Input id="title" name="title" placeholder="e.g. Research Coordinator" required />
          </div>
          <div className="w-24 space-y-2">
            <Label htmlFor="rank">Rank</Label>
            <Input id="rank" name="rank" type="number" defaultValue={100} />
          </div>
          <Button type="submit" size="icon" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
