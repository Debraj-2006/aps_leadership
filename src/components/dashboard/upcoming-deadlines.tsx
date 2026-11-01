import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import type { HandoverTask } from "@/lib/types";

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  high: "default",
  medium: "secondary",
  low: "outline",
};

export function UpcomingDeadlines({
  deadlines,
}: {
  deadlines: (HandoverTask & { handover_record?: { designation?: { title: string } | null } | null })[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deadlines.length === 0 && (
          <p className="text-sm text-muted-foreground">No pending deadlines. All clear.</p>
        )}
        {deadlines.map((task) => {
          const days = task.due_date
            ? differenceInCalendarDays(new Date(task.due_date), new Date())
            : null;
          return (
            <div key={task.id} className="flex items-start gap-3 rounded-lg border p-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <CalendarClock className="size-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium leading-tight">{task.title}</p>
                  <Badge variant={PRIORITY_VARIANT[task.priority]} className="shrink-0 capitalize">
                    {task.priority}
                  </Badge>
                </div>
                {task.handover_record?.designation?.title && (
                  <p className="text-xs text-muted-foreground">
                    Handover · {task.handover_record.designation.title}
                  </p>
                )}
                {task.due_date && (
                  <p className="text-xs text-muted-foreground">
                    Due {format(new Date(task.due_date), "dd MMM yyyy")}
                    {days !== null && days >= 0 && ` · ${days} day${days === 1 ? "" : "s"} left`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
