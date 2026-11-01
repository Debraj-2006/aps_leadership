import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "active";

const TONE: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  active: "bg-trace/30 text-trace-ink",
};

export function StatusPill({ tone, children, className }: { tone: StatusTone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE[tone],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export const EVENT_STATUS: Record<string, { tone: StatusTone; label: string }> = {
  planned: { tone: "info", label: "Planned" },
  completed: { tone: "success", label: "Completed" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

export const TENURE_STATUS: Record<string, { tone: StatusTone; label: string }> = {
  active: { tone: "active", label: "Active" },
  upcoming: { tone: "info", label: "Upcoming" },
  completed: { tone: "neutral", label: "Completed" },
};

export const HANDOVER_STATUS: Record<string, { tone: StatusTone; label: string }> = {
  pending: { tone: "neutral", label: "Pending" },
  in_progress: { tone: "info", label: "In progress" },
  completed: { tone: "warning", label: "Completed" },
  approved: { tone: "success", label: "Approved" },
};
