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

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; status?: string }>;
}) {
  const { profile } = await getCurrentProfile();
  const canManage = canManageEvents(profile.role);
  const params = await searchParams;
  const filtered = Boolean(params.search || (params.type && params.type !== "all") || (params.status && params.status !== "all"));

  const events = await getEvents(params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Technical talks, workshops, webinars, competitions and other chapter activities."
        actions={
          <>
            <EventsFilterBar />
            <ExportEventsButton events={events as ChapterEvent[]} scope="all-events" />
            {canManage && <EventFormDialog />}
          </>
        }
      />

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={filtered ? "No events match these filters" : "No events recorded yet"}
          description={filtered ? "Try a different search, type or status." : canManage ? "Use “New event” to record the first one." : "Events will appear here once they're added."}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((e) => {
            const status = EVENT_STATUS[e.status] ?? EVENT_STATUS.planned;
            return (
              <article key={e.id} className="flex flex-col rounded-xl border bg-card p-4">
                <div className="flex items-start gap-3">
                  <DateBlock date={e.event_date} />
                  <div className="min-w-0 flex-1">
                    <p className="type-eyebrow text-[10px] text-muted-foreground">
                      {TYPE_LABEL[e.type] ?? "Event"}
                    </p>
                    <h2 className="mt-1 leading-snug font-medium">{e.title}</h2>
                  </div>
                  <StatusPill tone={status.tone}>{status.label}</StatusPill>
                </div>

                {e.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{e.description}</p>}

                <dl className="mt-3 flex flex-1 flex-col gap-1.5 text-xs text-muted-foreground">
                  {e.venue && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0" />
                      <dt className="sr-only">Venue</dt>
                      <dd className="truncate">{e.venue}</dd>
                    </div>
                  )}
                  {e.speaker && (
                    <div className="flex items-center gap-1.5">
                      <Mic2 className="size-3.5 shrink-0" />
                      <dt className="sr-only">Speaker</dt>
                      <dd className="truncate">{e.speaker}</dd>
                    </div>
                  )}
                  {e.status === "completed" && (
                    <div className="flex items-center gap-1.5">
                      <Users className="size-3.5 shrink-0" />
                      <dt className="sr-only">Attendees</dt>
                      <dd>
                        <span className="type-readout">{e.attendees_count}</span> attended
                      </dd>
                    </div>
                  )}
                </dl>

                {canManage && (
                  <div className="mt-3 flex justify-end gap-1 border-t pt-3">
                    <EventFormDialog editing={e} />
                    <DeleteEventButton id={e.id} />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
