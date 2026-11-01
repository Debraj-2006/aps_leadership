"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Loader2, Pencil } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addCommitteeMember, updateCommitteeMember } from "@/lib/actions/leadership";
import { ROLE_LABELS } from "@/lib/roles";
import type { CommitteeMember, Designation, Profile, UserRole } from "@/lib/types";

interface Props {
  tenureId: string;
  designations: Designation[];
  profiles: Pick<Profile, "id" | "full_name" | "email" | "role">[];
  editing?: CommitteeMember;
}

export function MemberFormDialog({ tenureId, designations, profiles, editing }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("mode", mode);
    formData.set("tenure_id", tenureId);

    startTransition(async () => {
      const result = editing
        ? await updateCommitteeMember(editing.id, formData)
        : await addCommitteeMember(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(editing ? "Committee member updated." : "Committee member added.");
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
            <Plus className="size-4" /> Add member
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit committee member" : "Add committee member"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update designation or transition status for this member."
              : "Assign an existing user or register a new person to this tenure's committee."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {!editing && (
            <Tabs value={mode} onValueChange={(v) => setMode(v as "existing" | "new")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing">Existing person</TabsTrigger>
                <TabsTrigger value="new">New person</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {!editing && mode === "existing" && (
            <div className="space-y-2">
              <Label>Person</Label>
              <Select name="profile_id" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name} · {p.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!editing && mode === "new" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" placeholder="e.g. Ananya Sen" required />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="name@iem.edu.in" required />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="ieee_membership_no">IEEE membership number</Label>
                <Input id="ieee_membership_no" name="ieee_membership_no" placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roll_number">Roll number</Label>
                <Input id="roll_number" name="roll_number" placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="Optional" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>System role</Label>
                <Select name="role" defaultValue="working">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Designation</Label>
            <Select name="designation_id" defaultValue={editing?.designation_id} required>
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
            <Label htmlFor="custom_title">Custom title (optional)</Label>
            <Input
              id="custom_title"
              name="custom_title"
              placeholder="Override display title"
              defaultValue={editing?.custom_title ?? ""}
            />
          </div>

          {editing && (
            <div className="space-y-2">
              <Label htmlFor="left_at">Left on (optional)</Label>
              <Input id="left_at" name="left_at" type="date" defaultValue={editing?.left_at ?? ""} />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox id="is_outgoing" name="is_outgoing" defaultChecked={editing?.is_outgoing} />
            <Label htmlFor="is_outgoing" className="cursor-pointer font-normal">
              Mark as outgoing (transitioning out this tenure)
            </Label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Add to committee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
