"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportPdfButton({ onExport, label = "Export PDF" }: { onExport: () => void; label?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={onExport}>
      <Download className="size-4" /> {label}
    </Button>
  );
}
