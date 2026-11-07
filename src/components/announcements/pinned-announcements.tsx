import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Megaphone } from "lucide-react";
import type { Announcement } from "@/lib/actions/announcements";

// Pinned notices at the top of a home page. The page loads the data alongside its own.
export function PinnedAnnouncements({ items }: { items: Announcement[] }) {
  if (items.length === 0) return null;
  return (
    <section
      aria-label="Pinned announcements"
      className="overflow-hidden rounded-2xl bg-card shadow-[0_14px_34px_-24px_rgb(0_90_160/0.55)] ring-1 ring-trace/60"
    >
      <div className="h-1 bg-trace" aria-hidden="true" />
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="type-eyebrow flex items-center gap-2 text-trace-ink">
            <Megaphone className="size-3.5" /> Announcements
          </p>
          <Link href="/announcements" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
            All announcements
          </Link>
        </div>
        <ul className="mt-3 divide-y">
          {items.map((a) => (
            <li key={a.id} className="py-3 first:pt-0 last:pb-0">
              <p className="font-heading font-semibold leading-snug">{a.title}</p>
              <p className="mt-0.5 line-clamp-2 text-sm whitespace-pre-line text-muted-foreground">{a.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {a.author?.full_name ?? "An Executive"} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
