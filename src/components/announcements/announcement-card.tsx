import { formatDistanceToNow } from "date-fns";
import { Pin } from "lucide-react";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { AnnouncementFormDialog } from "@/components/announcements/announcement-form-dialog";
import { AnnouncementPinButton, DeleteAnnouncementButton } from "@/components/announcements/announcement-actions";
import type { Announcement } from "@/lib/actions/announcements";
import { cn } from "@/lib/utils";

export function AnnouncementCard({ item, canManage }: { item: Announcement; canManage: boolean }) {
  const author = item.author?.full_name ?? "An Executive";
  const edited = new Date(item.updated_at).getTime() - new Date(item.created_at).getTime() > 60_000;
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card p-5 shadow-[0_14px_34px_-24px_rgb(0_90_160/0.55)] ring-1 ring-primary/12",
        item.is_pinned && "ring-trace/60"
      )}
    >
      {item.is_pinned && <div className="absolute inset-x-0 top-0 h-1 bg-trace" aria-hidden="true" />}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {item.is_pinned && (
            <p className="type-eyebrow mb-1.5 flex items-center gap-1.5 text-[10px] text-trace-ink">
              <Pin className="size-3" /> Pinned
            </p>
          )}
          <h2 className="font-heading text-lg leading-snug font-semibold text-balance">{item.title}</h2>
        </div>
        {canManage && (
          <div className="-mt-1 -mr-2 flex shrink-0 items-center">
            <AnnouncementPinButton id={item.id} pinned={item.is_pinned} />
            <AnnouncementFormDialog editing={item} />
            <DeleteAnnouncementButton id={item.id} />
          </div>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-foreground/90">{item.body}</p>
      <div className="mt-4 flex items-center gap-2.5 border-t pt-3 text-xs text-muted-foreground">
        <MemberAvatar name={author} src={item.author?.avatar_url} className="size-7" fallbackClassName="text-[10px] font-medium" />
        <span className="min-w-0 truncate">
          <span className="font-medium text-foreground">{author}</span>
          {item.author?.position ? ` · ${item.author.position}` : ""}
          {" · "}
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          {edited ? " · edited" : ""}
        </span>
      </div>
    </article>
  );
}
