import { formatDistanceToNow } from "date-fns";
import { Paperclip, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { BadgeChip } from "@/components/recognition/badge-chip";
import { RemoveAwardButton } from "@/components/recognition/remove-award-button";
import { getBadge } from "@/lib/badges";
import { cn } from "@/lib/utils";
import type { RecognitionFeedItem } from "@/lib/actions/recognition";

// Latest points and badges, newest first. No ranking — just who was recognised and why.
export function RecognitionFeed({ items, canUndo = false }: { items: RecognitionFeedItem[]; canUndo?: boolean }) {
  if (items.length === 0) {
    return (
      <EmptyState compact icon={Sparkles} title="Nothing given yet" description="Points and badges will be listed here as they're given." />
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const positive = (item.points ?? 0) > 0;
        return (
          <li key={`${item.kind}-${item.id}`} className="flex gap-3">
            <div className="mt-0.5 shrink-0">
              {item.kind === "badge" && item.badge ? (
                <BadgeChip badge={item.badge} compact />
              ) : (
                <span
                  className={cn(
                    "type-readout inline-flex h-7 min-w-9 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                    positive ? "bg-success/12 text-success" : "bg-destructive/10 text-destructive"
                  )}
                >
                  {positive ? `+${item.points}` : item.points}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="leading-snug">
                <span className="font-medium">{item.recipient_name}</span>{" "}
                {item.kind === "badge" && item.badge ? (
                  <>
                    earned <span className="font-medium">{getBadge(item.badge).label}</span>
                  </>
                ) : positive ? (
                  <>earned {item.points} points</>
                ) : (
                  <>lost {Math.abs(item.points ?? 0)} points</>
                )}
                {item.event_title && <span className="text-muted-foreground"> · {item.event_title}</span>}
              </p>
              {item.text && <p className="mt-0.5 text-muted-foreground">{item.text}</p>}
              {item.media_url && (
                <a
                  href={item.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  <Paperclip className="size-3.5" />
                  {item.media_type === "application/pdf" ? "View certificate" : "View photo"}
                </a>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.awarder_name ? `${item.awarder_name} · ` : ""}
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
            {canUndo && <RemoveAwardButton id={item.id} kind={item.kind} />}
          </li>
        );
      })}
    </ul>
  );
}
