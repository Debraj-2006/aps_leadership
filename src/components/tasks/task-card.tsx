"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { format, isPast, parseISO } from "date-fns";
import { CalendarDays, CheckCircle2, Loader2, PlayCircle, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { deleteTask, updateTaskStatus } from "@/lib/actions/tasks";
import type { MemberTask, TaskStatus } from "@/lib/types";

const PRIORITY_EDGE: Record<string, string> = {
  high: "before:bg-destructive",
  medium: "before:bg-warning",
  low: "before:bg-muted-foreground/30",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function TaskCard({
  task,
  isAssignee,
  canManage,
  showAssignee,
}: {
  task: MemberTask;
  isAssignee: boolean;
  canManage: boolean;
  showAssignee: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const done = task.status === "completed";
  const overdue = !done && task.due_date && isPast(parseISO(task.due_date + "T23:59:59"));

  function setStatus(status: TaskStatus) {
    startTransition(async () => {
      const result = await updateTaskStatus(task.id, status);
      if (result?.error) toast.error(result.error);
      else toast.success(status === "completed" ? "Task marked as done." : status === "in_progress" ? "Task started." : "Task updated.");
    });
  }

  function handleDelete() {
    if (!confirm("Delete this task?")) return;
    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (result?.error) toast.error(result.error);
      else toast.success("Task deleted.");
    });
  }

  const showActions = (isAssignee && !done) || (done && (isAssignee || canManage)) || canManage;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card p-4 pl-5 shadow-[0_1px_0_0_rgb(10_26_47/0.03)]",
        "before:absolute before:inset-y-0 before:left-0 before:w-1",
        PRIORITY_EDGE[task.priority]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-sm leading-snug font-medium", done && "text-muted-foreground line-through")}>{task.title}</p>
        <span className="type-eyebrow shrink-0 text-[10px] text-muted-foreground">{PRIORITY_LABEL[task.priority]}</span>
      </div>
      {task.description && <p className="mt-1.5 text-sm text-muted-foreground">{task.description}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {task.due_date && (
          <span className={cn("type-readout flex items-center gap-1", overdue && "font-semibold text-destructive")}>
            <CalendarDays className="size-3.5" />
            {overdue ? "Overdue " : ""}
            {format(parseISO(task.due_date), "dd MMM")}
          </span>
        )}
        {task.event?.title && <span className="truncate">{task.event.title}</span>}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {showAssignee && task.assignee ? (
          <>
            For <span className="font-medium text-foreground">{task.assignee.full_name}</span>
            {" · "}
          </>
        ) : null}
        {task.assigner ? <>from {task.assigner.full_name}</> : "from a former member"}
      </p>

      {showActions && (
        <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5 border-t pt-3">
          {pending && <Loader2 className="mr-auto size-4 animate-spin text-muted-foreground" />}
          {isAssignee && task.status === "pending" && (
            <Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus("in_progress")}>
              <PlayCircle className="size-4" /> Start
            </Button>
          )}
          {isAssignee && !done && (
            <Button size="sm" disabled={pending} onClick={() => setStatus("completed")}>
              <CheckCircle2 className="size-4" /> Mark done
            </Button>
          )}
          {done && (isAssignee || canManage) && (
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => setStatus("in_progress")}>
              <RotateCcw className="size-4" /> Reopen
            </Button>
          )}
          {canManage && (
            <Button size="icon-sm" variant="ghost" disabled={pending} onClick={handleDelete} aria-label="Delete task">
              <Trash2 className="size-4 text-destructive" />
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
