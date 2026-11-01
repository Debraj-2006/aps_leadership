"use client";

import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { generateCommitteeReport } from "@/lib/pdf";
import type { CommitteeMember } from "@/lib/types";

export function ExportCommitteeButton({ members }: { members: CommitteeMember[] }) {
  function handleExport() {
    generateCommitteeReport(
      members.map((m) => ({
        name: m.profile?.full_name ?? "—",
        designation: m.custom_title || m.designation?.title || "—",
        email: m.profile?.email ?? "—",
        status: m.is_outgoing ? "Outgoing" : "Active",
      }))
    );
  }

  return <ExportPdfButton onExport={handleExport} />;
}
