import { formatDistanceToNow } from "date-fns";
import { Medal, Trophy } from "lucide-react";
import { cn } from "cn";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AwardPointsDialog } from "@/components/recognition/award-points-dialog";
import { AwardBadgeDialog } from "@/components/recognition/award-badge-dialog";
import { BadgeChip } from "@/components/recognition/badge-chip";
import { RemoveAwardButton } from "@/components/recognition/remove-award-button";
import { getCurrentProfile } from "@/lib/auth";
import { getLeaderboard, getRecentRecognition, getRecognitionOptions } from "@/lib/actions/recognition";
import { getBadge } from "@/lib/badges";
import { canAwardRecognition, ROLE_LABELS } from "@/lib/roles";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const PODIUM_STYLE: Record<number, string> = {
  1: "text-amber-500",
  2: "text-slate-400",
  3: "text-orange-600",
};

export default async function LeaderboardPage() {
  const { profile } = await getCurrentProfile();
  const canAward = canAwardRecognition(profile.role);

  const [leaderboard, feed, options] = await Promise.all([
    getLeaderboard(),
    getRecentRecognition(20),
    canAward ? getRecognitionOptions() : Promise.resolve(null),
  ]);

  const me = leaderboard.find((e) => e.profile_id === profile.id);
  const podium = leaderboard.filter((e) => e.points > 0 || e.badges.length > 0).slice(0, 3);
  const totalPoints = leaderboard.reduce((sum, e) => sum + e.points, 0);
  const totalBadges = leaderboard.reduce((sum, e) => sum + e.badges.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboard"
        description="Points and event badges given by the Executive Committee to Core and Working Committee members."
        actions={
          canAward && options ? (
            <>
              <AwardBadgeDialog members={options.members} events={options.events} />
              <AwardPointsDialog members={options.members} events={options.events} />
            </>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {me ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your standing</p>
              <p className="mt-1 text-2xl font-semibold">
                #{me.rank} <span className="text-base font-normal text-muted-foreground">of {leaderboard.length}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {me.points} points · {me.badges.length} badge{me.badges.length === 1 ? "" : "s"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Members ranked</p>
              <p className="mt-1 text-2xl font-semibold">{leaderboard.length}</p>
              <p className="text-sm text-muted-foreground">Core &amp; Working Committee</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Points given</p>
            <p className="mt-1 text-2xl font-semibold">{totalPoints}</p>
            <p className="text-sm text-muted-foreground">across all members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Badges awarded</p>
            <p className="mt-1 text-2xl font-semibold">{totalBadges}</p>
            <p className="text-sm text-muted-foreground">for chapter events</p>
          </CardContent>
        </Card>
      </div>

      {podium.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {podium.map((e) => (
            <Card key={e.profile_id} className={cn(e.rank === 1 && "border-amber-300 dark:border-amber-500/40")}>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="relative">
                  <Avatar className="size-12">
                    <AvatarFallback>{initials(e.full_name)}</AvatarFallback>
                  </Avatar>
                  <Medal className={cn("absolute -bottom-1 -right-1 size-5", PODIUM_STYLE[e.rank] ?? "text-muted-foreground")} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Rank #{e.rank}</p>
                  <p className="truncate font-medium">{e.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.points} pts · {e.badges.length} badge{e.badges.length === 1 ? "" : "s"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="size-4" /> Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No Core or Working Committee members yet. They&apos;ll appear here once they sign up.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">Rank</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Badges</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      {canAward && <TableHead className="text-right">Give</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((e) => (
                      <TableRow key={e.profile_id} className={cn(e.profile_id === profile.id && "bg-primary/5")}>
                        <TableCell className="font-semibold tabular-nums">#{e.rank}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-[11px]">{initials(e.full_name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium leading-tight">
                                {e.full_name}
                                {e.profile_id === profile.id && <span className="text-muted-foreground"> (you)</span>}
                              </p>
                              <Badge variant="outline" className="mt-0.5 text-[10px]">
                                {ROLE_LABELS[e.role]}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {e.badges.length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {e.badges.slice(0, 5).map((b) => (
                                <BadgeChip key={b.id} badge={b.badge} eventTitle={b.event_title} compact />
                              ))}
                              {e.badges.length > 5 && (
                                <span className="inline-flex h-7 items-center px-1 text-xs text-muted-foreground">
                                  +{e.badges.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-base font-semibold tabular-nums">{e.points}</TableCell>
                        {canAward && options && (
                          <TableCell className="text-right">
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent recognition</CardTitle>
          </CardHeader>
          <CardContent>
            {feed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No points or badges have been given yet.</p>
            ) : (
              <ul className="space-y-4">
                {feed.map((item) => (
                  <li key={`${item.kind}-${item.id}`} className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      {item.kind === "badge" && item.badge ? (
                        <BadgeChip badge={item.badge} compact />
                      ) : (
                        <span
                          className={cn(
                            "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
                            (item.points ?? 0) > 0
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                              : "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300"
                          )}
                        >
                          {(item.points ?? 0) > 0 ? `+${item.points}` : item.points}
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
                        ) : (item.points ?? 0) > 0 ? (
                          <>earned {item.points} points</>
                        ) : (
                          <>lost {Math.abs(item.points ?? 0)} points</>
                        )}
                        {item.event_title && <> for {item.event_title}</>}
                      </p>
                      {item.text && <p className="text-muted-foreground">{item.text}</p>}
                      <p className="text-xs text-muted-foreground">
                        {item.awarder_name ? `by ${item.awarder_name} · ` : ""}
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {canAward && <RemoveAwardButton id={item.id} kind={item.kind} />}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
