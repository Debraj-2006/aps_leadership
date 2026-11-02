import { format, parseISO } from "date-fns";
import { CalendarDays, MapPin, Mic2, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DateBlock } from "@/components/shared/date-block";
import { EVENT_STATUS, StatusPill } from "@/components/shared/status-pill";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { DeleteEventButton } from "@/components/events/delete-event-button";
import { EventsFilterBar } from "@/components/events/events-filter-bar";
import { ExportEventsButton } from "@/components/events/export-events-button";
import { getEvents } from "@/lib/actions/events";
import { getCurrentProfile } from "@/lib/auth";
import { canManageEvents } from "@/lib/roles";
import type { ChapterEvent } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  technical_talk: "Technical talk",
  workshop: "Workshop",
  webinar: "Webinar",
  competition: "Competition",
  seminar: "Seminar",
  social: "Social",
  other: "Other",
};

// "NA", "N/A", "-" and similar placeholders aren't worth showing.
function meaningful(value: string | null) {
  if (!value) return null;
  return /^(na|n\/a|none|nil|-+|—)$/i.test(value.trim()) ? null : value;
}

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
  searchParams: Promise<{ search?: string; type?: string; status?: string }>;
}) {
  const { profile } = await getCurrentProfile();
  const canManage = canManageEvents(profile.role);
  const params = await searchParams;
  const filtered = Boolean(params.search || (params.type && params.type !== "all") || (params.status && params.status !== "all"));

  const events = (await getEvents(params)) as ChapterEvent[];
  const groups = groupByMonth(events);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description={`Technical talks, workshops, webinars, competitions and other chapter activities.${events.length ? ` ${events.length} event${events.length === 1 ? "" : "s"}${filtered ? " match" : " in total"}.` : ""}`}
        actions={canManage ? <EventFormDialog /> : undefined}
      />

      <EventsFilterBar>
        <ExportEventsButton events={events} scope="all-events" />
      </EventsFilterBar>

      {events.length === 0 ? (
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
                        <h3 className="mt-1 pr-1 leading-snug font-medium">{e.title}</h3>
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

                        {canManage && (
                          <div className="mt-2 -mb-1 flex justify-end gap-0.5 opacity-100 transition-opacity lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
                            <EventFormDialog editing={e} />
                            <DeleteEventButton id={e.id} />
                          </div>
                        )}
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
