import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AddTaskDialog } from "@/components/handover/add-task-dialog";
import { TaskItem } from "@/components/handover/task-item";
import { LinkDocumentDialog } from "@/components/handover/link-document-dialog";
import { UnlinkDocumentButton } from "@/components/handover/unlink-document-button";
import { HandoverStatusActions } from "@/components/handover/handover-status-actions";
import { ExportHandoverButton } from "@/components/handover/export-handover-button";
import { getHandoverRecord } from "@/lib/actions/handover";
import { getDocuments } from "@/lib/actions/documents";
import { getCurrentProfile } from "@/lib/auth";
import { canApproveHandover } from "@/lib/roles";
import type { HandoverTask } from "@/lib/types";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  pending: "outline",
  in_progress: "secondary",
  completed: "default",
  approved: "default",
};

export default async function HandoverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await getCurrentProfile();
  const canApprove = canApproveHandover(profile.role);

  const [record, allDocuments] = await Promise.all([getHandoverRecord(id), getDocuments({})]);

  if (!record) notFound();

  const tasks: HandoverTask[] = record.tasks ?? [];
  const done = tasks.filter((t) => t.status === "completed").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const linkedDocs = (record.handover_documents ?? []) as {
    id: string;
    document: { id: string; title: string; file_path: string; category: string } | null;
  }[];
  const linkedDocIds = new Set(linkedDocs.map((ld) => ld.document?.id));
  const availableDocuments = allDocuments.filter((d) => !linkedDocIds.has(d.id));

  return (
    <div className="space-y-6">
      <Button nativeButton={false} render={<Link href="/handover" />} variant="ghost" size="sm" className="-ml-2">
        <ArrowLeft className="size-4" /> Back to Handover
      </Button>

      <PageHeader
        title={record.designation?.title ?? "Handover"}
        description="Structured transfer of responsibilities, tasks and documents."
        actions={
          <>
            <HandoverStatusActions id={record.id} status={record.status} canApprove={canApprove} />
            <ExportHandoverButton
              fromTenure={record.from_tenure?.academic_year ?? "—"}
              toTenure={record.to_tenure?.academic_year ?? "—"}
              designation={record.designation?.title ?? "Designation"}
              outgoing={record.outgoing_profile?.full_name ?? "—"}
              incoming={record.incoming_profile?.full_name ?? "—"}
              notes={record.notes ?? ""}
              tasks={tasks}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transition Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANT[record.status]} className="capitalize">
                {record.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{record.from_tenure?.academic_year}</span>
              <ArrowRight className="size-3.5" />
              <span>{record.to_tenure?.academic_year}</span>
            </div>
            <p>
              <span className="text-muted-foreground">Outgoing:</span> {record.outgoing_profile?.full_name}
              <br />
              <span className="text-xs text-muted-foreground">{record.outgoing_profile?.email}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Incoming:</span> {record.incoming_profile?.full_name}
              <br />
              <span className="text-xs text-muted-foreground">{record.incoming_profile?.email}</span>
            </p>
            {record.notes && (
              <div className="rounded-md bg-muted/50 p-3 text-sm">{record.notes}</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Handover Tasks</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {done}/{tasks.length} completed
              </p>
            </div>
            <AddTaskDialog handoverRecordId={record.id} />
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={progress} />
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks added yet.</p>
            ) : (
              tasks.map((t) => <TaskItem key={t.id} task={t} handoverRecordId={record.id} />)
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Linked Documents</CardTitle>
          <LinkDocumentDialog handoverRecordId={record.id} availableDocuments={availableDocuments} />
        </CardHeader>
        <CardContent>
          {linkedDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents linked yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {linkedDocs.map((ld) =>
                ld.document ? (
                  <div key={ld.id} className="flex items-center justify-between rounded-md border p-2.5">
                    <span className="flex items-center gap-2 text-sm">
                      <FileText className="size-4 text-primary" />
                      {ld.document.title}
                    </span>
                    <UnlinkDocumentButton id={ld.id} handoverRecordId={record.id} />
                  </div>
                ) : null
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
