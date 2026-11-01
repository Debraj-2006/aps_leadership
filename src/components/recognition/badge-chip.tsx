import { cn } from "cn";
import { getBadge } from "@/lib/badges";

// compact: icon only. label: icon + badge name. Default: icon + name + event.
export function BadgeChip({
  badge,
  eventTitle,
  compact = false,
  label = false,
}: {
  badge: string;
  eventTitle?: string | null;
  compact?: boolean;
  label?: boolean;
}) {
  const def = getBadge(badge);
  const Icon = def.icon;
  const title = eventTitle ? `${def.label} — ${eventTitle}` : def.label;

  if (compact) {
    return (
      <span
        title={title}
        aria-label={title}
        className={cn("inline-flex size-7 items-center justify-center rounded-full", def.className)}
      >
        <Icon className="size-3.5" />
      </span>
    );
  }

  if (label) {
    return (
      <span
        title={title}
        className={cn(
          "inline-flex max-w-[11rem] items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
          def.className
        )}
      >
        <Icon className="size-3 shrink-0" />
        <span className="truncate">{def.label}</span>
      </span>
    );
  }

  return (
    <span
      title={title}
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", def.className)}
    >
      <Icon className="size-3.5" />
      {def.label}
      {eventTitle && <span className="font-normal opacity-75">· {eventTitle}</span>}
    </span>
  );
}
