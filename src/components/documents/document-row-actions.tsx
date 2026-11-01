"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Eye, Download, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDocument, getDocumentUrl } from "@/lib/actions/documents";

export function DocumentRowActions({
  id,
  filePath,
  canDelete,
}: {
  id: string;
  filePath: string;
  canDelete: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleOpen(download: boolean) {
    startTransition(async () => {
      const result = await getDocumentUrl(filePath);
      if (result.error || !result.url) {
        toast.error(result.error || "Could not open document.");
        return;
      }
      if (download) {
        const link = document.createElement("a");
        link.href = result.url;
        link.download = "";
        link.click();
      } else {
        window.open(result.url, "_blank", "noopener,noreferrer");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Delete this document permanently?")) return;
    startTransition(async () => {
      const result = await deleteDocument(id, filePath);
      if (result?.error) toast.error(result.error);
      else toast.success("Document deleted.");
    });
  }

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={() => handleOpen(false)} disabled={pending} title="Preview">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleOpen(true)} disabled={pending} title="Download">
        <Download className="size-4" />
      </Button>
      {canDelete && (
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={pending} title="Delete">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}
