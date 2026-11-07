"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { celebrate } from "@/lib/celebrate";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reviewPointRequest, withdrawPointRequest } from "@/lib/actions/point-requests";

export function ReviewPointRequestButtons({ id, recipientName, points }: { id: string; recipientName: string; points: number }) {
  const [pending, startTransition] = useTransition();

  function review(approve: boolean) {
    if (!approve && !confirm(`Decline this request for ${recipientName}?`)) return;
    startTransition(async () => {
      const result = await reviewPointRequest(id, approve);
      if (result?.error) toast.error(result.error);
      else {
        toast.success(approve ? `${points} points given to ${recipientName}.` : "Request declined.");
        if (approve) celebrate();
      }
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      <Button size="sm" variant="outline" disabled={pending} onClick={() => review(false)}>
        <X className="size-3.5" /> Decline
      </Button>
      <Button size="sm" disabled={pending} onClick={() => review(true)}>
        <Check className="size-3.5" /> Approve
      </Button>
    </div>
  );
}

export function WithdrawPointRequestButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => {
        if (!confirm("Withdraw this request?")) return;
        startTransition(async () => {
          const result = await withdrawPointRequest(id);
          if (result?.error) toast.error(result.error);
          else toast.success("Request withdrawn.");
        });
      }}
    >
      {pending && <Loader2 className="size-3.5 animate-spin" />}
      Withdraw
    </Button>
  );
}
