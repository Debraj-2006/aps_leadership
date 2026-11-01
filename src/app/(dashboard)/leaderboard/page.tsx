import { formatDistanceToNow } from "date-fns";
import { Medal, Sparkles, Trophy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ReadoutStrip } from "@/components/shared/readout-strip";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AwardPointsDialog } from "@/components/recognition/award-points-dialog";
import { AwardBadgeDialog } from "@/components/recognition/award-badge-dialog";
import { BadgeChip } from "@/components/recognition/badge-chip";
import { MeterBar } from "@/components/recognition/meter-bar";
import { RemoveAwardButton } from "@/components/recognition/remove-award-button";
import { getCurrentProfile } from "@/lib/auth";
import { getLeaderboard, getRecentRecognition, getRecognitionOptions } from "@/lib/actions/recognition";
import { getBadge } from "@/lib/badges";
import { canAwardRecognition, peerPointRecipientRoles, ROLE_LABELS } from "@/lib/roles";
import { getPointRequestOptions } from "@/lib/actions/point-requests";
import { RequestPointsDialog } from "@/components/recognition/request-points-dialog";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const MEDAL_COLOR: Record<number, string> = {
  1: "text-[#d4a017]",
  2: "text-[#8a9aab]",
  3: "text-[#b8733a]",
};

export default async function LeaderboardPage() {
  const { profile } = await getCurrentProfile();
  const canAward = canAwardRecognition(profile.role);
  const canRequest = peerPointRecipientRoles(profile.role).length > 0;

  const [leaderboard, feed, options, requestOptions] = await Promise.all([
    getLeaderboard(),
    getRecentRecognition(20),
    canAward ? getRecognitionOptions() : Promise.resolve(null),
    canRequest ? getPointRequestOptions() : Promise.resolve(null),
  ]);

  const me = leaderboard.find((e) => e.profile_id === profile.id);
  // Members with no points or badges yet aren't given a rank.
  const isRanked = (e: { points: number; badges: unknown[] }) => e.points > 0 || e.badges.length > 0;
  const rankedCount = leaderboard.filter(isRanked).length;
  const podium = leaderboard.filter(isRanked).slice(0, 3);
  const topPoints = Math.max(...leaderboard.map((e) => e.points), 0);
  const totalPoints = leaderboard.reduce((sum, e) => sum + e.points, 0);
  const totalBadges = leaderboard.reduce((sum, e) => sum + e.badges.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboard"
        description="Everyone's points and event badges, ranked. Points are given or approved by the Executive Committee."
        actions={
          canAward && options ? (
            <>
              <AwardBadgeDialog members={options.members} events={options.events} />
              <AwardPointsDialog members={options.members} events={options.events} />
            </>
          ) : canRequest && requestOptions ? (
            <RequestPointsDialog members={requestOptions.members} events={requestOptions.events} myRole={profile.role} />
          ) : undefined
        }
      />

      <ReadoutStrip
        items={[
          me
            ? {
                label: "Your rank",
                value: isRanked(me) ? (
                  <>
                    #{me.rank}
                    <span className="ml-1.5 text-sm font-medium text-muted-foreground">of {rankedCount}</span>
                  </>
                ) : (
                  "—"
                ),
                hint: isRanked(me)
                  ? `${me.points} points · ${me.badges.length} badge${me.badges.length === 1 ? "" : "s"}`
                  : "Not ranked yet. Earn points to join the rankings.",
              }
            : { label: "Members ranked", value: leaderboard.length, hint: "Core & Working Committee" },
          { label: "Points given", value: totalPoints, hint: "Across all members" },
          { label: "Badges awarded", value: totalBadges, hint: "For chapter events" },
        ]}
      />

      {podium.length > 0 && (
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {podium.map((e) => (
            <li
              key={e.profile_id}
              className={cn(
                "relative flex items-center gap-4 overflow-hidden rounded-xl border bg-card p-5",
                e.rank === 1 && "border-trace/70 shadow-[inset_0_3px_0_0_var(--trace)]"
              )}
            >
              <span className="type-display text-[2.5rem] leading-none font-bold text-muted-foreground/30 tabular-nums">
                {e.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-medium">
                  <Medal className={cn("size-4 shrink-0", MEDAL_COLOR[e.rank] ?? "text-muted-foreground")} />
                  <span className="truncate">{e.full_name}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{ROLE_LABELS[e.role]}</p>
              </div>
              <div className="text-right">
                <p className="type-display text-2xl leading-none font-bold tabular-nums">{e.points}</p>
                <p className="type-eyebrow mt-1 text-[10px] text-muted-foreground">
                  {e.badges.length} badge{e.badges.length === 1 ? "" : "s"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-4 text-muted-foreground" /> Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {leaderboard.length === 0 ? (
              <div className="px-4">
                <EmptyState
                  icon={Trophy}
                  title="No one to rank yet"
                  description="Core and Working Committee members appear here once they sign up."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-14 pl-4">Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Badges</TableHead>
                    <TableHead className="w-40">Points</TableHead>
                    {canAward && <TableHead className="pr-4 text-right">Give</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((e) => {
                    const isMe = e.profile_id === profile.id;
                    return (
                      <TableRow key={e.profile_id} className={cn(isMe && "bg-trace/10 hover:bg-trace/15")}>
                        <TableCell className="type-readout pl-4 text-sm font-medium">
                          {isRanked(e) ? e.rank : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-[11px] font-medium">{initials(e.full_name)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium leading-tight">
                                {e.full_name}
                                {isMe && <span className="font-normal text-muted-foreground"> (you)</span>}
                              </p>
                              <p className="text-xs text-muted-foreground">{ROLE_LABELS[e.role]}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-48 whitespace-normal">
                          {e.badges.length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {e.badges.slice(0, 3).map((b) => (
                                <BadgeChip key={b.id} badge={b.badge} eventTitle={b.event_title} label />
                              ))}
                              {e.badges.length > 3 && (
                                <span className="inline-flex h-5 items-center px-1 text-[11px] text-muted-foreground">
                                  +{e.badges.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <MeterBar value={e.points} max={topPoints} className="w-20" />
                            <span className="type-readout w-10 text-right text-sm font-semibold">{e.points}</span>
                          </div>
                        </TableCell>
                        {canAward && options && (
                          <TableCell className="pr-4 text-right">
                            <div className="flex justify-end gap-1">
                              <AwardPointsDialog
                                members={options.members}
                                events={options.events}
                                defaultRecipientId={e.profile_id}
                                recipientName={e.full_name}
                                iconOnly
                              />
                              <AwardBadgeDialog
                                members={options.members}
                                events={options.events}
                                defaultRecipientId={e.profile_id}
                                recipientName={e.full_name}
                                iconOnly
                              />
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent recognition</CardTitle>
          </CardHeader>
          <CardContent>
            {feed.length === 0 ? (
              <EmptyState compact icon={Sparkles} title="Nothing given yet" description="Points and badges will be listed here as they're given." />
            ) : (
              <ul className="space-y-4">
                {feed.map((item) => {
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
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.awarder_name ? `${item.awarder_name} · ` : ""}
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {canAward && <RemoveAwardButton id={item.id} kind={item.kind} />}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
