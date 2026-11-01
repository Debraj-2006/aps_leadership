"use client";

import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { generateTenureReport } from "@/lib/pdf";
import { format } from "date-fns";

export function ExportTenureButton({
  academicYear,
  theme,
  achievements,
  members,
  events,
}: {
  academicYear: string;
  theme: string;
  achievements: string;
  members: { name: string; designation: string }[];
  events: { title: string; event_date: string; status: string }[];
}) {
  function handleExport() {
    generateTenureReport({
      academicYear,
      theme,
      achievements,
      members,
      events: events.map((e) => ({
        title: e.title,
        date: format(new Date(e.event_date), "dd MMM yyyy"),
        status: e.status,
      })),
    });
  }

  return <ExportPdfButton onExport={handleExport} label="Export Tenure Report" />;
}
