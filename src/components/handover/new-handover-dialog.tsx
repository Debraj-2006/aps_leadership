"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createHandoverRecord } from "@/lib/actions/handover";
import type { Designation, Profile, Tenure } from "@/lib/types";

export function NewHandoverDialog({
  tenures,
  designations,
  profiles,
}: {
  tenures: Pick<Tenure, "id" | "academic_year">[];
  designations: Designation[];
  profiles: Pick<Profile, "id" | "full_name" | "email">[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createHandoverRecord(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Handover record created.");
        setOpen(false);
        if (result.id) router.push(`/handover/${result.id}`);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" /> New Handover
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Handover Record</DialogTitle>
          <DialogDescription>
            Transfer a designation&apos;s responsibilities from an outgoing to an incoming member.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>From tenure (outgoing)</Label>
            <Select name="from_tenure_id" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent>
                {tenures.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.academic_year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>To tenure (incoming)</Label>
            <Select name="to_tenure_id" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent>
                {tenures.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.academic_year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Designation</Label>
            <Select name="designation_id" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                {designations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Outgoing member</Label>
            <Select name="outgoing_profile_id" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Incoming member</Label>
            <Select name="incoming_profile_id" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} placeholder="Important context for the incoming member" />
          </div>
          <DialogFooter className="col-span-2">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Create handover
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
