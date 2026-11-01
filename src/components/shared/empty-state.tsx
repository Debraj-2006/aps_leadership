import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// An empty plot: graticule with no trace yet, plus what to do next.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "graticule flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/70 px-6 text-center",
        compact ? "py-8" : "py-14",
        className
      )}
    >
      {Icon && (
        <span className="mb-3 flex size-10 items-center justify-center rounded-full border bg-card text-muted-foreground">
          <Icon className="size-[18px]" />
        </span>
      )}
      <p className="font-heading text-sm font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
