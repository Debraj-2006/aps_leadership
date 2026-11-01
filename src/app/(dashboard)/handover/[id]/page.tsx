import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { HANDOVER_STATUS, StatusPill } from "@/components/shared/status-pill";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export default async function HandoverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await getCurrentProfile();
  const canApprove = canApproveHandover(profile.role);

  const [record, allDocuments] = await Promise.all([getHandoverRecord(id), getDocuments({})]);

  if (!record) notFound();

  const tasks: HandoverTask[] = record.tasks ?? [];
  const done = tasks.filter((t) => t.status === "completed").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const status = HANDOVER_STATUS[record.status] ?? HANDOVER_STATUS.pending;

  const linkedDocs = (record.handover_documents ?? []) as {
    id: string;
    document: { id: string; title: string; file_path: string; category: string } | null;
  }[];
  const linkedDocIds = new Set(linkedDocs.map((ld) => ld.document?.id));
  const availableDocuments = allDocuments.filter((d) => !linkedDocIds.has(d.id));

  return (
    <div className="space-y-6">
      <Link
        href="/handover"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All handovers
      </Link>

      <PageHeader
        title={record.designation?.title ?? "Handover"}
        description={`${record.from_tenure?.academic_year ?? "—"} → ${record.to_tenure?.academic_year ?? "—"} · structured transfer of responsibilities, tasks and documents.`}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardAction>
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
              <div className="min-w-0">
                <p className="type-eyebrow text-[10px] text-muted-foreground">Outgoing</p>
                <p className="mt-1 truncate font-medium">{record.outgoing_profile?.full_name ?? "—"}</p>
                <p className="truncate text-xs text-muted-foreground">{record.outgoing_profile?.email}</p>
              </div>
              <ArrowRight className="mt-5 size-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="type-eyebrow text-[10px] text-muted-foreground">Incoming</p>
                <p className="mt-1 truncate font-medium">{record.incoming_profile?.full_name ?? "—"}</p>
                <p className="truncate text-xs text-muted-foreground">{record.incoming_profile?.email}</p>
              </div>
            </div>
            {record.notes && <div className="rounded-md bg-muted/60 p-3 text-sm">{record.notes}</div>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Handover tasks</CardTitle>
            <CardDescription>
              <span className="type-readout">
                {done}/{tasks.length}
              </span>{" "}
              completed
            </CardDescription>
            <CardAction>
              <AddTaskDialog handoverRecordId={record.id} />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={progress} />
            {tasks.length === 0 ? (
              <EmptyState compact icon={ListChecks} title="No tasks added yet" description="Add what the incoming member needs to pick up." />
            ) : (
              tasks.map((t) => <TaskItem key={t.id} task={t} handoverRecordId={record.id} />)
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Linked documents</CardTitle>
          <CardAction>
            <LinkDocumentDialog handoverRecordId={record.id} availableDocuments={availableDocuments} />
          </CardAction>
        </CardHeader>
        <CardContent>
          {linkedDocs.length === 0 ? (
            <EmptyState compact icon={FileText} title="No documents linked" description="Link reports, minutes or files the incoming member should read." />
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {linkedDocs.map((ld) =>
                ld.document ? (
                  <div key={ld.id} className="flex items-center justify-between gap-2 rounded-lg border p-2.5">
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <FileText className="size-4 shrink-0 text-primary" />
                      <span className="truncate">{ld.document.title}</span>
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
