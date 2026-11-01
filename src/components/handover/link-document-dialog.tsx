"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Link2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { linkHandoverDocument } from "@/lib/actions/handover";
import type { ChapterDocument } from "@/lib/types";

export function LinkDocumentDialog({
  handoverRecordId,
  availableDocuments,
}: {
  handoverRecordId: string;
  availableDocuments: Pick<ChapterDocument, "id" | "title" | "category">[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const documentId = String(formData.get("document_id") || "");
    if (!documentId) return;
    startTransition(async () => {
      const result = await linkHandoverDocument(handoverRecordId, documentId);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Document linked.");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Link2 className="size-4" /> Link document
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link a document</DialogTitle>
          <DialogDescription>Attach an existing document to this handover record.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Document</Label>
            <Select name="document_id" required disabled={availableDocuments.length === 0}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={availableDocuments.length ? "Select a document" : "No documents available"} />
              </SelectTrigger>
              <SelectContent>
                {availableDocuments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending || availableDocuments.length === 0}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
