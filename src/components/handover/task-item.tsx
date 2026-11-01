"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteHandoverTask, toggleHandoverTask } from "@/lib/actions/handover";
import { format } from "date-fns";
import type { HandoverTask } from "@/lib/types";

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  high: "default",
  medium: "secondary",
  low: "outline",
};

export function TaskItem({ task, handoverRecordId }: { task: HandoverTask; handoverRecordId: string }) {
  const [pending, startTransition] = useTransition();
  const checked = task.status === "completed";

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleHandoverTask(task.id, handoverRecordId, checked ? "pending" : "completed");
      if (result?.error) toast.error(result.error);
    });
  }

  function handleDelete() {
    if (!confirm("Remove this task?")) return;
    startTransition(async () => {
      const result = await deleteHandoverTask(task.id, handoverRecordId);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <Checkbox checked={checked} onCheckedChange={handleToggle} disabled={pending} className="mt-0.5" />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm font-medium ${checked ? "text-muted-foreground line-through" : ""}`}>
            {task.title}
          </p>
          <Badge variant={PRIORITY_VARIANT[task.priority]} className="capitalize">
            {task.priority}
          </Badge>
        </div>
        {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
        {task.due_date && (
          <p className="text-xs text-muted-foreground">Due {format(new Date(task.due_date), "dd MMM yyyy")}</p>
        )}
      </div>
      <Button variant="ghost" size="icon" onClick={handleDelete} disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 text-destructive" />}
      </Button>
    </div>
  );
}
