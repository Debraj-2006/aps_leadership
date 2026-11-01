"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { unlinkHandoverDocument } from "@/lib/actions/handover";

export function UnlinkDocumentButton({ id, handoverRecordId }: { id: string; handoverRecordId: string }) {
  const [pending, startTransition] = useTransition();

  function handleUnlink() {
    startTransition(async () => {
      const result = await unlinkHandoverDocument(id, handoverRecordId);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleUnlink} disabled={pending}>
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
    </Button>
  );
}
