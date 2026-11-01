import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { DocumentsFilterBar } from "@/components/documents/documents-filter-bar";
import { DocumentRowActions } from "@/components/documents/document-row-actions";
import { getDocuments } from "@/lib/actions/documents";
import { getTenuresForSelect } from "@/lib/actions/leadership";
import { getCurrentProfile } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { format } from "date-fns";
import { FileText } from "lucide-react";

const CATEGORY_LABEL: Record<string, string> = {
  event_report: "Event Report",
  meeting_minutes: "Meeting Minutes",
  certificate: "Certificate",
  financial_report: "Financial Report",
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
  searchParams: Promise<{ search?: string; category?: string; tenureId?: string }>;
}) {
  const { profile } = await getCurrentProfile();
  const params = await searchParams;

  const [documents, tenures] = await Promise.all([getDocuments(params), getTenuresForSelect()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Management"
        description="Event reports, meeting minutes, certificates and financial records — centrally stored."
        actions={
          <>
            <DocumentsFilterBar tenures={tenures} />
            <UploadDialog tenures={tenures} />
          </>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents match the current filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Tenure</TableHead>
                    <TableHead>Uploaded by</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-primary" />
                          <span className="font-medium">{d.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{CATEGORY_LABEL[d.category]}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {d.tenure?.academic_year ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {d.uploader?.full_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatSize(d.file_size)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(d.created_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
