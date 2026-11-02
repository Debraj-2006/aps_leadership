import { format } from "date-fns";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { DocumentsFilterBar } from "@/components/documents/documents-filter-bar";
import { DocumentRowActions } from "@/components/documents/document-row-actions";
import { getDocuments } from "@/lib/actions/documents";
import { getCurrentProfile } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

const CATEGORY_LABEL: Record<string, string> = {
  event_report: "Event report",
  meeting_minutes: "Meeting minutes",
  certificate: "Certificate",
  financial_report: "Financial report",
  handover: "Handover",
  other: "Other",
};

function formatSize(bytes: number) {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { profile } = await getCurrentProfile();
  const params = await searchParams;
  const filtered = Boolean(params.search || (params.category && params.category !== "all"));

  const documents = await getDocuments(params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Event reports, meeting minutes, certificates and financial records, stored in one place."
        actions={<UploadDialog />}
      />

      <DocumentsFilterBar />
      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={filtered ? "No documents match these filters" : "No documents yet"}
          description={filtered ? "Try a different search or category." : "Use “Upload document” to add the first report or minutes."}
        />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-2.5">
                      <FileText className="size-4 shrink-0 text-primary" />
                      <span className="font-medium">{d.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{CATEGORY_LABEL[d.category]}</TableCell>
                  <TableCell className="text-muted-foreground">{d.uploader?.full_name ?? "—"}</TableCell>
                  <TableCell className="type-readout text-right text-xs text-muted-foreground">{formatSize(d.file_size)}</TableCell>
                  <TableCell className="type-readout text-xs text-muted-foreground">{format(new Date(d.created_at), "dd MMM yyyy")}</TableCell>
                  <TableCell className="pr-5">
                    <DocumentRowActions
                      id={d.id}
                      filePath={d.file_path}
                      canDelete={isAdminRole(profile.role) || d.uploaded_by === profile.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
