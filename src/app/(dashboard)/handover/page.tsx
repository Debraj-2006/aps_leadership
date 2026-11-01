import Link from "next/link";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { HANDOVER_STATUS, StatusPill } from "@/components/shared/status-pill";
import { Progress } from "@/components/ui/progress";
import { NewHandoverDialog } from "@/components/handover/new-handover-dialog";
import { getHandoverRecords } from "@/lib/actions/handover";
import { getDesignations, getProfilesForSelect } from "@/lib/actions/leadership";
import { getCurrentProfile } from "@/lib/auth";
import { canApproveHandover } from "@/lib/roles";
import type { HandoverTask } from "@/lib/types";

export default async function HandoverPage() {
  const { profile } = await getCurrentProfile();
  const canManage = canApproveHandover(profile.role);

  const [records, designations, profiles] = await Promise.all([
    getHandoverRecords(),
    getDesignations(),
    getProfilesForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Handover"
        description="Transfer responsibilities, pending tasks and documents from outgoing to incoming committee members."
        actions={canManage ? <NewHandoverDialog designations={designations} profiles={profiles} /> : undefined}
      />

      {records.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No handovers yet"
          description={
            canManage
              ? "Use “New handover” when an outgoing member passes a role to their successor."
              : "Handovers you're part of will appear here."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {records.map((r) => {
            const tasks = (r.tasks ?? []) as HandoverTask[];
            const done = tasks.filter((t) => t.status === "completed").length;
            const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
            const status = HANDOVER_STATUS[r.status] ?? HANDOVER_STATUS.pending;
            return (
              <Link
                key={r.id}
                href={`/handover/${r.id}`}
                className="group flex flex-col rounded-xl border bg-card p-5 transition-colors outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="type-eyebrow text-[10px] text-muted-foreground">
                      Started {new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    <h2 className="mt-1 truncate font-medium">{r.designation?.title ?? "Role"}</h2>
                  </div>
                  <StatusPill tone={status.tone}>{status.label}</StatusPill>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="min-w-0 truncate">{r.outgoing_profile?.full_name ?? "—"}</span>
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 truncate font-medium">{r.incoming_profile?.full_name ?? "—"}</span>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tasks done</span>
                    <span className="type-readout">
                      {done}/{tasks.length}
                    </span>
                  </div>
                  <Progress value={progress} />
                </div>

                <p className="mt-4 text-xs font-medium text-primary group-hover:underline">Open handover</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
