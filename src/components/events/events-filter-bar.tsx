"use client";

import { FilterToolbar } from "@/components/shared/filter-toolbar";

export function EventsFilterBar({ children }: { children?: React.ReactNode }) {
  return (
    <FilterToolbar
      basePath="/events"
      searchPlaceholder="Search events"
      selects={[
        {
          param: "type",
          label: "Event type",
          options: [
            { value: "all", label: "All types" },
            { value: "technical_talk", label: "Technical talk" },
            { value: "workshop", label: "Workshop" },
            { value: "webinar", label: "Webinar" },
            { value: "competition", label: "Competition" },
            { value: "seminar", label: "Seminar" },
            { value: "social", label: "Social" },
            { value: "other", label: "Other" },
          ],
        },
        {
          param: "status",
          label: "Status",
          options: [
            { value: "all", label: "All statuses" },
            { value: "planned", label: "Planned" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ],
        },
      ]}
    >
      {children}
    </FilterToolbar>
  );
}
