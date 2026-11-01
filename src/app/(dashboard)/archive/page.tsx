import { format, parseISO } from "date-fns";
import { Archive, CalendarRange, FileText, Trophy, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill, TENURE_STATUS } from "@/components/shared/status-pill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TenureFilter } from "@/components/leadership/tenure-filter";
import { ExportTenureButton } from "@/components/tenure/export-tenure-button";
import { getTenuresForSelect } from "@/lib/actions/leadership";
import { getArchiveTenure } from "@/lib/actions/archive";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ tenure?: string }>;
}) {
  const tenures = await getTenuresForSelect();
  const { tenure } = await searchParams;

  const selectedTenureId =
    tenure || tenures.find((t) => t.status === "completed")?.id || tenures[0]?.id;

  if (!selectedTenureId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Archive" description="Previous committees, their events and achievements, by tenure." />
        <EmptyState icon={Archive} title="Nothing archived yet" description="Each tenure appears here with its committee, events and documents." />
      </div>
    );
  }

  const { tenure: t, members, events, documents } = await getArchiveTenure(selectedTenureId);

  if (!t) return null;
  const status = TENURE_STATUS[t.status] ?? TENURE_STATUS.completed;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Archive"
        description="Previous committees, their events and achievements, by tenure."
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

      <section className="relative overflow-hidden rounded-xl bg-ink p-6 text-sidebar-foreground sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="type-eyebrow text-trace">Tenure</p>
            <h2 className="type-display mt-2 text-3xl font-bold tracking-[-0.02em] text-white tabular-nums sm:text-4xl">
              {t.academic_year}
            </h2>
            {t.theme && <p className="mt-2 text-sm text-sidebar-foreground/85">{t.theme}</p>}
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <StatusPill tone={status.tone} className={t.status === "active" ? "bg-trace text-ink" : "bg-white/10 text-sidebar-foreground"}>
              {status.label}
            </StatusPill>
            <p className="type-readout flex items-center gap-1.5 text-xs text-sidebar-foreground/70">
              <CalendarRange className="size-3.5" />
              {format(parseISO(t.start_date), "dd MMM yyyy")} – {format(parseISO(t.end_date), "dd MMM yyyy")}
            </p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-white/10">
          {[
            ["Committee", members.length],
            ["Events", events.length],
            ["Documents", documents.length],
          ].map(([label, value]) => (
            <div key={label as string} className="bg-ink/95 px-4 py-3">
              <dt className="type-eyebrow text-[10px] text-sidebar-foreground/55">{label}</dt>
              <dd className="type-display mt-1 text-xl font-bold text-white tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {t.achievements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-4 text-muted-foreground" /> Key achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">{t.achievements}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" /> Committee
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <EmptyState compact title="No committee recorded" />
            ) : (
              <ul className="divide-y">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium">{m.profile?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{m.custom_title || m.designation?.title}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarRange className="size-4 text-muted-foreground" /> Events conducted
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <EmptyState compact title="No events recorded" />
            ) : (
              <ul className="divide-y">
                {events.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="type-readout text-xs text-muted-foreground">{format(parseISO(e.event_date), "dd MMM yyyy")}</p>
                    </div>
                    <span className="type-eyebrow shrink-0 text-[10px] text-muted-foreground">{e.type.replace("_", " ")}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" /> Archived documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <EmptyState compact title="No documents archived for this tenure" />
          ) : (
            <ul className="flex flex-wrap gap-2">
              {documents.map((d) => (
                <li key={d.id} className="inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1 text-sm">
                  <FileText className="size-3.5 text-primary" />
                  {d.title}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
