"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeCommitteeMember } from "@/lib/actions/leadership";

export function DeleteMemberButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Remove this member from the committee roster?")) return;
    startTransition(async () => {
      const result = await removeCommitteeMember(id);
      if (result?.error) toast.error(result.error);
      else toast.success("Member removed from roster.");
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 text-destructive" />}
    </Button>
  );
}
