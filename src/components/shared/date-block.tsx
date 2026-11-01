import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

// Tear-off calendar date: month above, day below.
export function DateBlock({ date, className }: { date: string; className?: string }) {
  const d = parseISO(date);
  return (
    <div
      className={cn("flex w-12 shrink-0 flex-col items-center rounded-md border bg-muted/60 py-1.5", className)}
      aria-label={format(d, "d MMMM yyyy")}
    >
      <span className="type-eyebrow text-[10px] leading-3 text-primary">{format(d, "MMM")}</span>
      <span className="type-display text-lg leading-6 font-bold tabular-nums">{format(d, "dd")}</span>
    </div>
  );
}
