import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { DeleteEventButton } from "@/components/events/delete-event-button";
import { EventsFilterBar } from "@/components/events/events-filter-bar";
import { ExportEventsButton } from "@/components/events/export-events-button";
import { getEvents } from "@/lib/actions/events";
import { getTenuresForSelect } from "@/lib/actions/leadership";
import { getCurrentProfile } from "@/lib/auth";
import { canManageEvents } from "@/lib/roles";
import { format } from "date-fns";
import { CalendarDays, MapPin, Mic2, Users } from "lucide-react";
import type { ChapterEvent } from "@/lib/types";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  planned: "secondary",
  completed: "default",
  cancelled: "outline",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; status?: string; tenureId?: string }>;
}) {
  const { profile } = await getCurrentProfile();
  const canManage = canManageEvents(profile.role);
  const params = await searchParams;

  const [events, tenures] = await Promise.all([getEvents(params), getTenuresForSelect()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Management"
        description="Technical talks, workshops, webinars, competitions and chapter activities."
        actions={
          <>
            <EventsFilterBar tenures={tenures} />
            <ExportEventsButton events={events as ChapterEvent[]} scope="all-events" />
            {canManage && <EventFormDialog tenures={tenures} />}
          </>
        }
      />

      {events.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No events match the current filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((e) => (
            <Card key={e.id} className="flex flex-col">
              <CardContent className="flex-1 space-y-3 pt-6">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {e.type.replace("_", " ")}
                  </Badge>
                  <Badge variant={STATUS_VARIANT[e.status]} className="capitalize">
                    {e.status}
                  </Badge>
                </div>
                <p className="font-medium leading-tight">{e.title}</p>
                {e.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{e.description}</p>
                )}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" /> {format(new Date(e.event_date), "dd MMM yyyy")}
                    {e.tenure?.academic_year ? ` · ${e.tenure.academic_year}` : ""}
                  </p>
                  {e.venue && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" /> {e.venue}
                    </p>
                  )}
                  {e.speaker && (
                    <p className="flex items-center gap-1.5">
                      <Mic2 className="size-3.5" /> {e.speaker}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5">
                    <Users className="size-3.5" /> {e.attendees_count} attendees
                  </p>
                </div>
                {canManage && (
                  <div className="flex justify-end gap-1 border-t pt-3">
                    <EventFormDialog tenures={tenures} editing={e} />
                    <DeleteEventButton id={e.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
