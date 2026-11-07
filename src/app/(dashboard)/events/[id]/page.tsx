import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowLeft, CalendarDays, CalendarPlus, MapPin, Mic2, Tag, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EVENT_STATUS, StatusPill } from "@/components/shared/status-pill";
import { Card, CardContent } from "@/components/ui/card";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { getEvent } from "@/lib/actions/events";
import { getCurrentProfile } from "@/lib/auth";
import { googleCalendarUrl } from "@/lib/calendar";
import { EVENT_TYPE_LABEL, meaningful } from "@/lib/event-labels";
import { canManageEvents } from "@/lib/roles";
import type { ChapterEvent } from "@/lib/types";

function Detail({ icon: Icon, label, children }: { icon: typeof Tag; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="type-eyebrow text-[10px] text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm">{children}</dd>
      </div>
    </div>
  );
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ profile }, event] = await Promise.all([getCurrentProfile(), getEvent(id)]);
  if (!event) notFound();
  const e = event as ChapterEvent;
  const canManage = canManageEvents(profile.role);
  const status = EVENT_STATUS[e.status] ?? EVENT_STATUS.planned;
  const venue = meaningful(e.venue);
  const speaker = meaningful(e.speaker);

  return (
    <div className="space-y-6">
      <Link href="/events" className="-mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" /> All events
      </Link>
      <PageHeader
        title={e.title}
        description={`${EVENT_TYPE_LABEL[e.type] ?? "Event"} · ${format(parseISO(e.event_date), "EEEE d MMMM yyyy")}`}
        actions={
          <>
            <a
              href={googleCalendarUrl(e)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-primary transition-colors hover:bg-secondary"
            >
              <CalendarPlus className="size-4" /> Add to Google Calendar
            </a>
            {canManage && <EventFormDialog editing={e} />}
          </>
        }
      />

      <Card>
        <CardContent className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Detail icon={CalendarDays} label="Date">
              {format(parseISO(e.event_date), "d MMMM yyyy")}
            </Detail>
            <Detail icon={Tag} label="Status">
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
            </Detail>
            {venue && (
              <Detail icon={MapPin} label="Venue">
                {venue}
              </Detail>
            )}
            {speaker && (
              <Detail icon={Mic2} label="Speaker">
                {speaker}
              </Detail>
            )}
            {e.attendees_count > 0 && (
              <Detail icon={Users} label="Attendance">
                <span className="type-readout">{e.attendees_count}</span> people attended
              </Detail>
            )}
          </dl>
          {e.description && (
            <div className="border-t pt-5">
              <h2 className="type-eyebrow text-primary">About this event</h2>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{e.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
