"use client";

import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { generateEventsReport } from "@/lib/pdf";
import { format } from "date-fns";
import type { ChapterEvent } from "@/lib/types";

export function ExportEventsButton({ events, scope }: { events: ChapterEvent[]; scope: string }) {
  function handleExport() {
    generateEventsReport(
      scope,
      events.map((e) => ({
        title: e.title,
        type: e.type.replace("_", " "),
        date: format(new Date(e.event_date), "dd MMM yyyy"),
        status: e.status,
        venue: e.venue ?? "—",
      }))
    );
  }

  return <ExportPdfButton onExport={handleExport} />;
}
