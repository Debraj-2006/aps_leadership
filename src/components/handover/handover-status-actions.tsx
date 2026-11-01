"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateHandoverStatus } from "@/lib/actions/handover";
import type { HandoverStatus } from "@/lib/types";

export function HandoverStatusActions({
  id,
  status,
  canApprove,
}: {
  id: string;
  status: HandoverStatus;
  canApprove: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function setStatus(next: HandoverStatus) {
    startTransition(async () => {
      const result = await updateHandoverStatus(id, next);
      if (result?.error) toast.error(result.error);
      else toast.success(`Handover marked as ${next.replace("_", " ")}.`);
    });
  }

  return (
    <div className="flex gap-2">
      {status !== "completed" && status !== "approved" && (
        <Button size="sm" variant="outline" onClick={() => setStatus("completed")} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          Mark Completed
        </Button>
      )}
      {canApprove && status === "completed" && (
        <Button size="sm" onClick={() => setStatus("approved")} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
          Approve Handover
        </Button>
      )}
    </div>
  );
}
