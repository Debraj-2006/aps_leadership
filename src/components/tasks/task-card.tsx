"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { format, isPast, parseISO } from "date-fns";
import { CalendarDays, CheckCircle2, Circle, Loader2, PlayCircle, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "cn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteTask, updateTaskStatus } from "@/lib/actions/tasks";
import type { MemberTask, TaskStatus } from "@/lib/types";

const PRIORITY_STYLE: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  low: "bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "To do",
  in_progress: "In progress",
  completed: "Done",
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
      else toast.success(status === "completed" ? "Task marked as done." : "Task updated.");
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

  const StatusIcon = done ? CheckCircle2 : task.status === "in_progress" ? PlayCircle : Circle;

  return (
    <Card className={cn(done && "opacity-75")}>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start gap-3">
          <StatusIcon
            className={cn(
              "mt-0.5 size-5 shrink-0",
              done ? "text-emerald-600" : task.status === "in_progress" ? "text-sky-600" : "text-muted-foreground"
            )}
          />
          <div className="min-w-0 flex-1">
            <p className={cn("font-medium leading-tight", done && "line-through")}>{task.title}</p>
            {task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={cn("rounded-full px-2 py-0.5 font-medium capitalize", PRIORITY_STYLE[task.priority])}>
            {task.priority}
          </span>
          <Badge variant="outline">{STATUS_LABEL[task.status]}</Badge>
          {task.due_date && (
            <span className={cn("flex items-center gap-1", overdue ? "font-medium text-destructive" : "text-muted-foreground")}>
              <CalendarDays className="size-3.5" />
              {overdue ? "Overdue · " : "Due "}
              {format(parseISO(task.due_date), "dd MMM yyyy")}
            </span>
          )}
          {task.event?.title && <span className="text-muted-foreground">· {task.event.title}</span>}
        </div>

        <p className="text-xs text-muted-foreground">
          {showAssignee && task.assignee ? <>For <span className="font-medium text-foreground">{task.assignee.full_name}</span> · </> : null}
          {task.assigner ? <>Assigned by {task.assigner.full_name}</> : "Assigned by a former member"}
        </p>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3">
          {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
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
            <Button size="icon" variant="ghost" disabled={pending} onClick={handleDelete} aria-label="Delete task">
              <Trash2 className="size-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
