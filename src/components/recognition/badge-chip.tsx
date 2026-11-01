import { Paperclip } from "lucide-react";
import { cn } from "cn";
import { getBadge } from "@/lib/badges";

// compact: icon only. label: icon + badge name. Default: icon + name + event.
// With a mediaUrl (certificate or photo) the chip shows a paperclip and opens the file.
export function BadgeChip({
  badge,
  eventTitle,
  compact = false,
  label = false,
  mediaUrl,
}: {
  badge: string;
  eventTitle?: string | null;
  compact?: boolean;
  label?: boolean;
  mediaUrl?: string | null;
}) {
  const def = getBadge(badge);
  const Icon = def.icon;
  const title = `${eventTitle ? `${def.label} — ${eventTitle}` : def.label}${mediaUrl ? " (open attachment)" : ""}`;

  let chip: React.ReactNode;
  if (compact) {
    chip = (
      <span
        title={title}
        aria-label={title}
        className={cn("relative inline-flex size-7 items-center justify-center rounded-full", def.className)}
      >
        <Icon className="size-3.5" />
        {mediaUrl && (
          <Paperclip className="absolute -right-1 -bottom-1 size-3 rounded-full bg-card p-px text-foreground" />
        )}
      </span>
    );
  } else if (label) {
    chip = (
      <span
        title={title}
        className={cn(
          "inline-flex max-w-[11rem] items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
          def.className
        )}
      >
        <Icon className="size-3 shrink-0" />
        <span className="truncate">{def.label}</span>
        {mediaUrl && <Paperclip className="size-3 shrink-0 opacity-80" />}
      </span>
    );
  } else {
    chip = (
      <span
        title={title}
        className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", def.className)}
      >
        <Icon className="size-3.5" />
        {def.label}
        {eventTitle && <span className="font-normal opacity-75">· {eventTitle}</span>}
        {mediaUrl && <Paperclip className="size-3.5 opacity-80" />}
      </span>
    );
  }

  if (!mediaUrl) return chip;
  return (
    <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring">
      {chip}
    </a>
  );
}
