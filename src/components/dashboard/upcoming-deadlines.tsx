import Link from "next/link";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { CalendarClock } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { HandoverTask } from "@/lib/types";

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-muted-foreground/40",
};

export function UpcomingDeadlines({
  deadlines,
}: {
  deadlines: (HandoverTask & { handover_record?: { designation?: { title: string } | null } | null })[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Handover deadlines</CardTitle>
        <CardAction>
          <Link href="/handover" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
            Handovers
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <EmptyState compact icon={CalendarClock} title="No open deadlines" description="Handover tasks with due dates show up here." />
        ) : (
          <ul className="space-y-3">
            {deadlines.map((task) => {
              const due = task.due_date ? parseISO(task.due_date) : null;
              const days = due ? differenceInCalendarDays(due, new Date()) : null;
              return (
                <li key={task.id} className="flex items-start gap-3">
                  <span
                    className={cn("mt-1.5 size-2 shrink-0 rounded-full", PRIORITY_DOT[task.priority])}
                    title={`${task.priority} priority`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug font-medium">{task.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {task.handover_record?.designation?.title ?? "Handover"}
                      {due && ` · due ${format(due, "dd MMM")}`}
                    </p>
                  </div>
                  {days !== null && (
                    <span className={cn("type-readout shrink-0 text-xs", days <= 3 ? "text-destructive" : "text-muted-foreground")}>
                      {days === 0 ? "today" : `${days}d`}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
