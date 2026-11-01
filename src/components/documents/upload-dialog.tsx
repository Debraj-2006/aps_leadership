"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadDocument } from "@/lib/actions/documents";
import type { Tenure } from "@/lib/types";

export function UploadDialog({ tenures }: { tenures: Pick<Tenure, "id" | "academic_year">[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await uploadDocument(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Document uploaded.");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Upload className="size-4" /> Upload Document
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Event reports, meeting minutes, certificates, financial reports and other official files.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document title</Label>
            <Input id="title" name="title" required placeholder="e.g. AGM Minutes - March 2026" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" name="file" type="file" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select name="category" defaultValue="event_report">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event_report">Event Report</SelectItem>
                  <SelectItem value="meeting_minutes">Meeting Minutes</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="financial_report">Financial Report</SelectItem>
                  <SelectItem value="handover">Handover</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select name="visibility" defaultValue="all">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="committee_only">Committee only</SelectItem>
                  <SelectItem value="admin_only">Admins only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tenure</Label>
            <Select name="tenure_id">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Associate with a tenure (optional)" />
              </SelectTrigger>
              <SelectContent>
                {tenures.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.academic_year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
