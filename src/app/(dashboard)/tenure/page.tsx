import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { CalendarCheck2, CalendarRange, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill, TENURE_STATUS } from "@/components/shared/status-pill";
import { TenureFormDialog } from "@/components/tenure/tenure-form-dialog";
import { DeleteTenureButton } from "@/components/tenure/delete-tenure-button";
import { getTenuresWithCounts } from "@/lib/actions/tenure";
import { getCurrentProfile } from "@/lib/auth";
import { canManageTenures } from "@/lib/roles";
import { cn } from "@/lib/utils";

function elapsedPercent(start: string, end: string) {
  const total = differenceInCalendarDays(parseISO(end), parseISO(start));
  const done = differenceInCalendarDays(new Date(), parseISO(start));
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

export default async function TenurePage() {
  const { profile } = await getCurrentProfile();
  const canManage = canManageTenures(profile.role);
  const tenures = await getTenuresWithCounts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenure"
        description="Academic-year committees, their timelines, themes and milestones."
        actions={canManage ? <TenureFormDialog /> : undefined}
      />

      {tenures.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No tenures yet"
          description={canManage ? "Use “New tenure” to create the current academic year." : "Tenures will appear here once an Executive creates one."}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tenures.map((t) => {
            const status = TENURE_STATUS[t.status] ?? TENURE_STATUS.upcoming;
            const pct = t.status === "active" ? elapsedPercent(t.start_date, t.end_date) : null;
            return (
              <article
                key={t.id}
                className={cn(
                  "flex flex-col rounded-xl border bg-card p-5",
                  t.status === "active" && "shadow-[inset_0_3px_0_0_var(--trace)]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="type-display text-xl font-bold tracking-[-0.01em] tabular-nums">{t.academic_year}</h2>
                    <p className="type-readout mt-1 text-xs text-muted-foreground">
                      {format(parseISO(t.start_date), "dd MMM yyyy")} – {format(parseISO(t.end_date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <StatusPill tone={status.tone}>{status.label}</StatusPill>
                </div>

                {pct !== null && (
                  <div className="mt-4">
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">{pct}% of the year complete</p>
                  </div>
                )}

                <div className="mt-4 flex-1 space-y-2">
                  {t.theme && <p className="text-sm font-medium text-primary">{t.theme}</p>}
                  {t.achievements && <p className="line-clamp-3 text-sm text-muted-foreground">{t.achievements}</p>}
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" /> <span className="type-readout">{t.memberCount}</span> members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarCheck2 className="size-3.5" /> <span className="type-readout">{t.eventCount}</span> events
                  </span>
                </div>

                {canManage && (
                  <div className="mt-4 flex justify-end gap-1 border-t pt-3">
                    <TenureFormDialog editing={t} />
                    <DeleteTenureButton id={t.id} />
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
