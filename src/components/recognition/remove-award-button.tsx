"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeBadgeAward, removePointAward } from "@/lib/actions/recognition";

export function RemoveAwardButton({ id, kind }: { id: string; kind: "points" | "badge" }) {
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    if (!confirm(kind === "points" ? "Remove this points award?" : "Remove this badge?")) return;
    startTransition(async () => {
      const result = kind === "points" ? await removePointAward(id) : await removeBadgeAward(id);
      if (result?.error) toast.error(result.error);
      else toast.success(kind === "points" ? "Points award removed." : "Badge removed.");
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRemove}
      disabled={pending}
      aria-label={kind === "points" ? "Remove points award" : "Remove badge"}
      title="Undo"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Undo2 className="size-4 text-muted-foreground" />}
    </Button>
  );
}
