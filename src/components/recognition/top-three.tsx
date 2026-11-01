import Link from "next/link";
import { Medal, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BadgeChip } from "@/components/recognition/badge-chip";
import { ROLE_LABELS } from "@/lib/roles";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/actions/recognition";

const PLACE = {
  1: { label: "1st", medal: "text-[#d4a017]", ring: "border-[#d4a017]/60 shadow-[inset_0_3px_0_0_#d4a017]" },
  2: { label: "2nd", medal: "text-[#8a9aab]", ring: "border-[#8a9aab]/50 shadow-[inset_0_3px_0_0_#8a9aab]" },
  3: { label: "3rd", medal: "text-[#b8733a]", ring: "border-[#b8733a]/50 shadow-[inset_0_3px_0_0_#b8733a]" },
} as const;

// The members currently in 1st, 2nd and 3rd place by points (badges break ties).
// Members on equal points and badges share a place.
export function TopThree({ entries, currentUserId }: { entries: LeaderboardEntry[]; currentUserId?: string }) {
  const top = entries.filter((e) => (e.points > 0 || e.badges.length > 0) && e.rank <= 3);

  return (
    <section aria-labelledby="top-three-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="top-three-heading" className="type-eyebrow flex items-center gap-2 text-foreground">
          <Trophy className="size-3.5 text-trace" /> Top 3 members
        </h2>
        <Link href="/leaderboard" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
          Full leaderboard
        </Link>
      </div>
      {top.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card/70 px-4 py-5 text-center text-sm text-muted-foreground">
          No points given yet. The top 3 appear here once members earn points.
        </p>
      ) : (
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {top.map((e) => {
            const place = PLACE[e.rank as 1 | 2 | 3];
            const isMe = e.profile_id === currentUserId;
            return (
              <li key={e.profile_id} className={cn("flex flex-col gap-3 rounded-xl border bg-card p-4", place.ring)}>
                <div className="flex items-center gap-3">
                <div className="flex w-10 shrink-0 flex-col items-center">
                  <Medal className={cn("size-6", place.medal)} />
                  <span className="type-display mt-0.5 text-sm font-bold">{place.label}</span>
                </div>
                <Avatar className="size-9">
                  <AvatarFallback className="text-[11px] font-medium">{initials(e.full_name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {e.full_name}
                    {isMe && <span className="font-normal text-muted-foreground"> (you)</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{ROLE_LABELS[e.role]}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="type-display text-xl leading-none font-bold tabular-nums">{e.points}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    pts · {e.badges.length} badge{e.badges.length === 1 ? "" : "s"}
                  </p>
                </div>
                </div>
                {e.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 border-t pt-3">
                    {e.badges.slice(0, 3).map((b) => (
                      <BadgeChip key={b.id} badge={b.badge} eventTitle={b.event_title} label />
                    ))}
                    {e.badges.length > 3 && (
                      <span className="inline-flex h-5 items-center px-1 text-[11px] text-muted-foreground">+{e.badges.length - 3} more</span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
