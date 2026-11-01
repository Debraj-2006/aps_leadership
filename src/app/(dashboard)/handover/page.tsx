import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { NewHandoverDialog } from "@/components/handover/new-handover-dialog";
import { getHandoverRecords } from "@/lib/actions/handover";
import { getDesignations, getProfilesForSelect, getTenuresForSelect } from "@/lib/actions/leadership";
import { getCurrentProfile } from "@/lib/auth";
import { canApproveHandover } from "@/lib/roles";
import { ArrowRight, ArrowLeftRight } from "lucide-react";
import type { HandoverTask } from "@/lib/types";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  pending: "outline",
  in_progress: "secondary",
  completed: "default",
  approved: "default",
};

export default async function HandoverPage() {
  const { profile } = await getCurrentProfile();
  const canManage = canApproveHandover(profile.role);

  const [records, tenures, designations, profiles] = await Promise.all([
    getHandoverRecords(),
    getTenuresForSelect(),
    getDesignations(),
    getProfilesForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Handover Management"
        description="Transfer responsibilities, pending tasks and documents from outgoing to incoming committee members."
        actions={canManage ? <NewHandoverDialog tenures={tenures} designations={designations} profiles={profiles} /> : undefined}
      />

      {records.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No handover records yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {records.map((r) => {
            const tasks = (r.tasks ?? []) as HandoverTask[];
            const done = tasks.filter((t) => t.status === "completed").length;
            const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
            return (
              <Card key={r.id} className="flex flex-col">
                <CardContent className="flex-1 space-y-3 pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">{r.designation?.title ?? "Designation"}</Badge>
                    <Badge variant={STATUS_VARIANT[r.status]} className="capitalize">
                      {r.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowLeftRight className="size-3.5 text-muted-foreground" />
                    <span>{r.from_tenure?.academic_year}</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                    <span>{r.to_tenure?.academic_year}</span>
                  </div>
                  <div className="text-sm">
                    <p>
                      <span className="text-muted-foreground">Outgoing:</span>{" "}
                      {r.outgoing_profile?.full_name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Incoming:</span>{" "}
                      {r.incoming_profile?.full_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Task progress</span>
                      <span>{done}/{tasks.length}</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  <Button nativeButton={false} render={<Link href={`/handover/${r.id}`} />} size="sm" variant="outline" className="w-full">
                    View details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
