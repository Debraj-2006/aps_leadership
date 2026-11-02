"use client";

import { FilterToolbar } from "@/components/shared/filter-toolbar";

export function DocumentsFilterBar() {
  return (
    <FilterToolbar
      basePath="/documents"
      searchPlaceholder="Search documents"
      selects={[
        {
          param: "category",
          label: "Category",
          options: [
            { value: "all", label: "All categories" },
            { value: "event_report", label: "Event report" },
            { value: "meeting_minutes", label: "Meeting minutes" },
            { value: "certificate", label: "Certificate" },
            { value: "financial_report", label: "Financial report" },
            { value: "handover", label: "Handover" },
            { value: "other", label: "Other" },
          ],
        },
      ]}
    />
  );
}
