"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setUserActive } from "@/lib/actions/users";

export function ActiveToggleButton({
  profileId,
  isActive,
  name,
}: {
  profileId: string;
  isActive: boolean;
  name?: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    if (isActive && !confirm(`Deactivate ${name ?? "this account"}? They will lose access to the hub.`)) return;
    startTransition(async () => {
      const result = await setUserActive(profileId, !isActive);
      if (result?.error) toast.error(result.error);
      else toast.success(isActive ? "Account deactivated." : `${name ?? "Account"} approved.`);
    });
  }

  return (
    <Button variant={isActive ? "outline" : "default"} size="sm" onClick={handleToggle} disabled={pending}>
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : !isActive && <Check className="size-3.5" />}
      {isActive ? "Deactivate" : "Approve"}
    </Button>
  );
}
