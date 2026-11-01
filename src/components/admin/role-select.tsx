"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setUserRole } from "@/lib/actions/users";
import { ROLE_LABELS } from "@/lib/roles";
import type { UserRole } from "@/lib/types";

export function RoleSelect({ profileId, role }: { profileId: string; role: UserRole }) {
  const [pending, startTransition] = useTransition();

  function handleChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      const result = await setUserRole(profileId, value as UserRole);
      if (result?.error) toast.error(result.error);
      else toast.success("Role updated.");
    });
  }

  return (
    <Select defaultValue={role} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="w-48">
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
  );
}
