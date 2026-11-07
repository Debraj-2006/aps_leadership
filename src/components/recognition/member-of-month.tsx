import Link from "next/link";
import { Gadget } from "@/components/brand/gadgets";
import { MemberAvatar } from "@/components/shared/member-avatar";
import type { MemberOfMonth } from "@/lib/actions/recognition";
import { ROLE_LABELS } from "@/lib/roles";

export function MemberOfMonthCard({ star }: { star: MemberOfMonth | null }) {
  if (!star) return null;
  const { member } = star;
  return (
    <section
      aria-label={`Member of the month for ${star.monthLabel}`}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-trace/20 via-card to-card shadow-[0_14px_34px_-24px_rgb(0_90_160/0.55)] ring-1 ring-trace/60"
    >
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <div className="relative shrink-0">
          <MemberAvatar
            name={member.full_name}
            src={member.avatar_url}
            className="size-16 ring-4 ring-trace"
            fallbackClassName="bg-ink text-lg font-semibold text-white"
          />
          <Gadget name="trophy" className="absolute -right-3 -bottom-2 size-9 drop-shadow" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="type-eyebrow text-trace-ink">
            {star.isCurrentMonth ? `Star of ${star.monthLabel}` : `Star of ${star.monthLabel} (last month)`}
          </p>
          <p className="mt-0.5 truncate font-heading text-xl font-semibold">{member.full_name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {member.position || ROLE_LABELS[member.role]} ·{" "}
            <span className="font-semibold text-foreground">
              {star.points} point{star.points === 1 ? "" : "s"}
            </span>{" "}
            {star.isCurrentMonth ? "this month" : "that month"} from {star.awards} award{star.awards === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/leaderboard" className="hidden shrink-0 text-xs font-medium text-primary underline-offset-4 hover:underline sm:block">
          Leaderboard
        </Link>
      </div>
    </section>
  );
}
