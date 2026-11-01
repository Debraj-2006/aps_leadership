"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setUserActive } from "@/lib/actions/users";

export function ActiveToggleButton({ profileId, isActive }: { profileId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await setUserActive(profileId, !isActive);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Button variant={isActive ? "outline" : "secondary"} size="sm" onClick={handleToggle} disabled={pending}>
      {pending && <Loader2 className="size-3.5 animate-spin" />}
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
