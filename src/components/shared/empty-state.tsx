import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Nothing here yet: the icon sits in a round white face wearing Doraemon's collar and bell,
// followed by what to do next.
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
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/25 bg-gradient-to-b from-card to-secondary/55 px-6 text-center",
        compact ? "py-8" : "py-14",
        className
      )}
    >
      {Icon && (
        <span className="mb-4 flex flex-col items-center" aria-hidden="true">
          <span
            className={cn(
              "flex items-center justify-center rounded-full bg-card text-primary shadow-[0_8px_18px_-10px_rgb(0_90_160/0.6)] ring-4 ring-primary/15",
              compact ? "size-11" : "size-14"
            )}
          >
            <Icon className={compact ? "size-5" : "size-6"} />
          </span>
          <span className={cn("-mt-1 h-1.5 rounded-full bg-collar", compact ? "w-9" : "w-11")} />
          <span className="-mt-0.5 size-2.5 rounded-full bg-trace ring-1 ring-[#7a5600]/50" />
        </span>
      )}
      <p className="font-heading text-base font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
