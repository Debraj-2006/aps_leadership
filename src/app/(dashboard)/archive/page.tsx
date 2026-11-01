import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TenureFilter } from "@/components/leadership/tenure-filter";
import { ExportTenureButton } from "@/components/tenure/export-tenure-button";
import { getTenuresForSelect } from "@/lib/actions/leadership";
import { getArchiveTenure } from "@/lib/actions/archive";
import { format } from "date-fns";
import { Archive, CalendarRange, FileText, Trophy, Users } from "lucide-react";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ tenure?: string }>;
}) {
  const tenures = await getTenuresForSelect();
  const { tenure } = await searchParams;

  const completedOrdered = [...tenures].sort((a) => (a.status === "completed" ? -1 : 1));
  const selectedTenureId = tenure || completedOrdered.find((t) => t.status === "completed")?.id || tenures[0]?.id;

  if (!selectedTenureId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Historical Archive" description="Explore previous executive committees and their achievements." />
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No tenures recorded yet.
          </CardContent>
        </Card>
      </div>
    );
  }

  const { tenure: t, members, events, documents } = await getArchiveTenure(selectedTenureId);

  if (!t) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historical Archive"
        description="Explore previous executive committees, events and achievements by tenure."
        actions={
          <>
            <TenureFilter tenures={tenures} current={selectedTenureId} basePath="/archive" />
            <ExportTenureButton
              academicYear={t.academic_year}
              theme={t.theme ?? ""}
              achievements={t.achievements ?? ""}
              members={members.map((m) => ({
                name: m.profile?.full_name ?? "—",
                designation: m.custom_title || m.designation?.title || "—",
              }))}
              events={events}
            />
          </>
        }
      />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Archive className="size-5 text-primary" />
              <h2 className="text-xl font-semibold">{t.academic_year}</h2>
              <Badge variant="outline" className="capitalize">{t.status}</Badge>
            </div>
            {t.theme && <p className="mt-1 text-sm text-primary">{t.theme}</p>}
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarRange className="size-3.5" />
              {format(new Date(t.start_date), "dd MMM yyyy")} &ndash; {format(new Date(t.end_date), "dd MMM yyyy")}
            </p>
          </div>
        </CardContent>
      </Card>

      {t.achievements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="size-4 text-accent-foreground" /> Key Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{t.achievements}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4" /> Executive Committee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No committee data recorded.</p>
            ) : (
              members.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{m.profile?.full_name}</p>
                  <Badge variant="secondary">{m.custom_title || m.designation?.title}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="size-4" /> Events Conducted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events recorded.</p>
            ) : (
              events.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium leading-tight">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(e.event_date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 capitalize">{e.type.replace("_", " ")}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4" /> Archived Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents archived for this tenure.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {documents.map((d) => (
                <Badge key={d.id} variant="secondary">
                  {d.title}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
