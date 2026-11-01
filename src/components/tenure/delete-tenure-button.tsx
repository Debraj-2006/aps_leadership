"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteTenure } from "@/lib/actions/tenure";

export function DeleteTenureButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this tenure? This also removes its committee roster links.")) return;
    startTransition(async () => {
      const result = await deleteTenure(id);
      if (result?.error) toast.error(result.error);
      else toast.success("Tenure deleted.");
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 text-destructive" />}
    </Button>
  );
}
