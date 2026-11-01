"use client";

import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { generateHandoverReport } from "@/lib/pdf";
import { format } from "date-fns";
import type { HandoverTask } from "@/lib/types";

export function ExportHandoverButton(params: {
  designation: string;
  outgoing: string;
  incoming: string;
  notes: string;
  tasks: HandoverTask[];
}) {
  function handleExport() {
    generateHandoverReport({
      ...params,
      tasks: params.tasks.map((t) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.due_date ? format(new Date(t.due_date), "dd MMM yyyy") : "—",
      })),
    });
  }

  return <ExportPdfButton onExport={handleExport} label="Export summary" />;
}
