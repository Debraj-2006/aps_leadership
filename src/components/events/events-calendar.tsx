import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EVENT_TYPE_LABEL } from "@/lib/event-labels";
import type { ChapterEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_CHIP: Record<string, string> = {
  technical_talk: "bg-primary/12 text-primary",
  workshop: "bg-[#5fbf3a]/15 text-[#2f7d12] dark:text-[#8fe06a]",
  webinar: "bg-[#7c5cff]/12 text-[#5b3fd6] dark:text-[#b4a2ff]",
  competition: "bg-collar/12 text-collar",
  seminar: "bg-trace/25 text-trace-ink",
  social: "bg-[#f9b4cf]/35 text-[#b02d67] dark:text-[#ffb3d1]",
  other: "bg-muted text-muted-foreground",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function EventsCalendar({
  events,
  month,
  monthHref,
}: {
  events: ChapterEvent[];
  /** Any date inside the month to show. */
  month: Date;
  monthHref: (month: string) => string;
}) {
  const first = startOfMonth(month);
  const days = eachDayOfInterval({
    start: startOfWeek(first, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(first), { weekStartsOn: 1 }),
  });
  const byDay = new Map<string, ChapterEvent[]>();
  for (const e of events) {
    const list = byDay.get(e.event_date) ?? [];
    list.push(e);
    byDay.set(e.event_date, list);
  }
  const inMonth = events
    .filter((e) => isSameMonth(parseISO(e.event_date), first))
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  const prev = format(addMonths(first, -1), "yyyy-MM");
  const next = format(addMonths(first, 1), "yyyy-MM");

  return (
    <section aria-label={`Events in ${format(first, "MMMM yyyy")}`} className="overflow-hidden rounded-2xl bg-card shadow-[0_14px_34px_-24px_rgb(0_90_160/0.55)] ring-1 ring-primary/12">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4">
        <Link
          href={monthHref(prev)}
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={`Previous month, ${format(addMonths(first, -1), "MMMM yyyy")}`}
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div className="text-center">
          <h2 className="font-heading text-lg font-semibold">{format(first, "MMMM yyyy")}</h2>
          <p className="text-xs text-muted-foreground">
            {inMonth.length === 0 ? "No events this month" : `${inMonth.length} event${inMonth.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href={monthHref(next)}
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={`Next month, ${format(addMonths(first, 1), "MMMM yyyy")}`}
        >
          <ChevronRight className="size-5" />
        </Link>
      </div>

      {/* Month grid on wider screens */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-7 border-b bg-secondary/60">
          {WEEKDAYS.map((d) => (
            <div key={d} className="type-eyebrow px-2 py-2 text-center text-[10px] text-primary">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const list = byDay.get(key) ?? [];
            const outside = !isSameMonth(day, first);
            return (
              <div
                key={key}
                className={cn(
                  "min-h-28 border-r border-b p-1.5 [&:nth-child(7n)]:border-r-0",
                  outside && "bg-muted/40"
                )}
              >
                <div className="mb-1 flex justify-end">
                  <span
                    className={cn(
                      "type-readout flex size-6 items-center justify-center rounded-full text-xs",
                      outside ? "text-muted-foreground/60" : "text-muted-foreground",
                      isToday(day) && "bg-trace font-bold text-[#0f2a47]"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <ul className="space-y-1">
                  {list.slice(0, 3).map((e) => (
                    <li key={e.id}>
                      <Link
                        href={`/events/${e.id}`}
                        title={`${e.title} · ${EVENT_TYPE_LABEL[e.type] ?? "Event"}`}
                        className={cn(
                          "block truncate rounded-md px-1.5 py-1 text-[11px] leading-tight font-semibold transition-opacity hover:opacity-80",
                          TYPE_CHIP[e.type] ?? TYPE_CHIP.other
                        )}
                      >
                        {e.title}
                      </Link>
                    </li>
                  ))}
                  {list.length > 3 && <li className="px-1.5 text-[11px] text-muted-foreground">+{list.length - 3} more</li>}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day-by-day list on phones */}
      <ul className="divide-y sm:hidden">
        {inMonth.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">Nothing on the calendar this month.</li>
        ) : (
          inMonth.map((e) => (
            <li key={e.id}>
              <Link href={`/events/${e.id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/45">
                <span className="w-12 shrink-0 text-center">
                  <span className="type-eyebrow block text-[10px] text-primary">{format(parseISO(e.event_date), "EEE")}</span>
                  <span className="type-display block text-lg leading-6 font-bold">{format(parseISO(e.event_date), "d")}</span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{e.title}</span>
                  <span className="block text-xs text-muted-foreground">{EVENT_TYPE_LABEL[e.type] ?? "Event"}</span>
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
