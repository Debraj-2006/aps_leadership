import { cn } from "cn";
import { getBadge } from "@/lib/badges";

export function BadgeChip({
  badge,
  eventTitle,
  compact = false,
}: {
  badge: string;
  eventTitle?: string | null;
  compact?: boolean;
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
