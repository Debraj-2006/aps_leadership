import Link from "next/link";
import { format, parseISO } from "date-fns";
import { CalendarDays, CalendarPlus, LayoutList, MapPin, Mic2, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DateBlock } from "@/components/shared/date-block";
import { EVENT_STATUS, StatusPill } from "@/components/shared/status-pill";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { DeleteEventButton } from "@/components/events/delete-event-button";
import { EventsFilterBar } from "@/components/events/events-filter-bar";
import { ExportEventsButton } from "@/components/events/export-events-button";
import { EventsCalendar } from "@/components/events/events-calendar";
import { getEvents } from "@/lib/actions/events";
import { googleCalendarUrl } from "@/lib/calendar";
import { EVENT_TYPE_LABEL as TYPE_LABEL, meaningful } from "@/lib/event-labels";
import { cn } from "@/lib/utils";
import { getCurrentProfile } from "@/lib/auth";
import { canManageEvents } from "@/lib/roles";
import type { ChapterEvent } from "@/lib/types";

function groupByMonth(events: ChapterEvent[]) {
  const groups: { month: string; events: ChapterEvent[] }[] = [];
  for (const e of events) {
    const month = format(parseISO(e.event_date), "MMMM yyyy");
    const last = groups[groups.length - 1];
    if (last && last.month === month) last.events.push(e);
    else groups.push({ month, events: [e] });
  }
  return groups;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; status?: string; view?: string; month?: string }>;
}) {
  const { profile } = await getCurrentProfile();
  const canManage = canManageEvents(profile.role);
  const params = await searchParams;
  const filtered = Boolean(params.search || (params.type && params.type !== "all") || (params.status && params.status !== "all"));

  const events = (await getEvents(params)) as ChapterEvent[];
  const groups = groupByMonth(events);

  const view = params.view === "calendar" ? "calendar" : "list";
  const month = /^\d{4}-\d{2}$/.test(params.month ?? "") ? parseISO(`${params.month}-01`) : new Date();
  // Links keep the current search and filters.
  const hrefWith = (changes: Record<string, string | null>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ search: params.search, type: params.type, status: params.status, view, month: params.month }))
      if (v) q.set(k, v);
    for (const [k, v] of Object.entries(changes)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    if (q.get("view") === "list") q.delete("view");
    const qs = q.toString();
    return qs ? `/events?${qs}` : "/events";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description={`Technical talks, workshops, webinars, competitions and other chapter activities.${events.length ? ` ${events.length} event${events.length === 1 ? "" : "s"}${filtered ? " match" : " in total"}.` : ""}`}
        actions={canManage ? <EventFormDialog /> : undefined}
      />

      <nav aria-label="Event views" className="inline-flex rounded-xl bg-card p-1 shadow-sm ring-1 ring-primary/12">
        {(
          [
            ["list", "List", LayoutList],
            ["calendar", "Calendar", CalendarDays],
          ] as const
        ).map(([v, label, Icon]) => (
          <Link
            key={v}
            href={hrefWith({ view: v, month: v === "list" ? null : params.month ?? null })}
            aria-current={view === v ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              view === v ? "bg-ink text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" /> {label}
          </Link>
        ))}
      </nav>

      <EventsFilterBar>
        <ExportEventsButton events={events} scope="all-events" />
      </EventsFilterBar>

      {view === "calendar" ? (
        <EventsCalendar events={events} month={month} monthHref={(m) => hrefWith({ view: "calendar", month: m })} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={filtered ? "No events match these filters" : "No events recorded yet"}
          description={filtered ? "Try a different search, type or status." : canManage ? "Use “New event” to record the first one." : "Events will appear here once they're added."}
        />
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.month} aria-label={g.month}>
              <h2 className="type-eyebrow mb-3 flex items-center gap-2 text-foreground">
                {g.month}
                <span className="type-readout rounded-full bg-card px-2 py-0.5 text-[11px] text-muted-foreground ring-1 ring-border">
                  {g.events.length}
                </span>
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {g.events.map((e) => {
                  const status = EVENT_STATUS[e.status] ?? EVENT_STATUS.planned;
                  const venue = meaningful(e.venue);
                  const speaker = meaningful(e.speaker);
                  return (
                    <article key={e.id} className="group relative flex gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30">
                      <div className="shrink-0 self-start">
                        <DateBlock date={e.event_date} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="type-eyebrow pt-0.5 text-[10px] text-muted-foreground">{TYPE_LABEL[e.type] ?? "Event"}</p>
                          {e.status !== "completed" && <StatusPill tone={status.tone}>{status.label}</StatusPill>}
                        </div>
                        <h3 className="mt-1 pr-1 leading-snug font-medium">
                          <Link href={`/events/${e.id}`} className="outline-none after:absolute after:inset-0 after:rounded-xl hover:text-primary focus-visible:underline">
                            {e.title}
                          </Link>
                        </h3>
                        {e.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{e.description}</p>}

                        {(venue || speaker || e.attendees_count > 0) && (
                          <dl className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {venue && (
                              <div className="flex min-w-0 items-center gap-1">
                                <MapPin className="size-3.5 shrink-0" />
                                <dt className="sr-only">Venue</dt>
                                <dd className="truncate">{venue}</dd>
                              </div>
                            )}
                            {speaker && (
                              <div className="flex min-w-0 items-center gap-1">
                                <Mic2 className="size-3.5 shrink-0" />
                                <dt className="sr-only">Speaker</dt>
                                <dd className="truncate">{speaker}</dd>
                              </div>
                            )}
                            {e.attendees_count > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="size-3.5 shrink-0" />
                                <dt className="sr-only">Attendees</dt>
                                <dd>
                                  <span className="type-readout">{e.attendees_count}</span> attended
                                </dd>
                              </div>
                            )}
                          </dl>
                        )}

                        <div className="relative z-10 mt-2 -mb-1 flex justify-end gap-0.5">
                          <a
                            href={googleCalendarUrl(e)}
                            target="_blank"
                            rel="noreferrer"
                            title="Add to Google Calendar"
                            aria-label={`Add ${e.title} to Google Calendar`}
                            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                          >
                            <CalendarPlus className="size-4" />
                          </a>
                          {canManage && (
                            <>
                              <EventFormDialog editing={e} />
                              <DeleteEventButton id={e.id} />
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
