"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateMyProfile } from "@/lib/actions/profile";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateMyProfile(formData);
      if (result?.error) toast.error(result.error);
      else toast.success("Profile saved.");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="profile-name">Full name</Label>
        <Input id="profile-name" name="full_name" required minLength={2} maxLength={80} defaultValue={profile.full_name} autoComplete="name" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profile-phone">Phone</Label>
          <Input
            id="profile-phone"
            name="phone"
            type="tel"
            maxLength={20}
            defaultValue={profile.phone ?? ""}
            placeholder="+91 98765 43210"
            autoComplete="tel"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-roll">Roll number</Label>
          <Input id="profile-roll" name="roll_number" maxLength={30} defaultValue={profile.roll_number ?? ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-ieee">IEEE membership number</Label>
        <Input
          id="profile-ieee"
          name="ieee_membership_no"
          inputMode="numeric"
          maxLength={12}
          defaultValue={profile.ieee_membership_no ?? ""}
          placeholder="e.g. 96100024"
        />
        <p className="text-xs text-muted-foreground">You can also sign in with this number.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-bio">About me</Label>
        <Textarea
          id="profile-bio"
          name="bio"
          rows={3}
          maxLength={300}
          defaultValue={profile.bio ?? ""}
          placeholder="A line or two about you: your branch, year, or what you enjoy working on."
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Save details
        </Button>
      </div>
    </form>
  );
}
