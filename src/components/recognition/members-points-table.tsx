import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { BadgeChip } from "@/components/recognition/badge-chip";
import { ROLE_LABELS } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/actions/recognition";

// Every Core and Working member's points and badges, listed by name (not ranked).
export function MembersPointsTable({ entries, currentUserId }: { entries: LeaderboardEntry[]; currentUserId: string }) {
  const sorted = [...entries].sort((a, b) => a.full_name.localeCompare(b.full_name));

  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" /> Everyone&apos;s points
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {sorted.length === 0 ? (
          <div className="px-4 pb-4">
            <EmptyState compact icon={Users} title="No members yet" description="Core and Working Committee members appear here." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Member</TableHead>
                <TableHead>Badges</TableHead>
                <TableHead className="pr-5 text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((e) => {
                const isMe = e.profile_id === currentUserId;
                return (
                  <TableRow key={e.profile_id} className={cn(isMe && "bg-trace/10 hover:bg-trace/15")}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <MemberAvatar name={e.full_name} src={e.avatar_url} className="size-8" fallbackClassName="text-[11px] font-medium" />
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
                            <BadgeChip key={b.id} badge={b.badge} eventTitle={b.event_title} mediaUrl={b.media_url} label />
                          ))}
                          {e.badges.length > 3 && (
                            <span className="inline-flex h-5 items-center px-1 text-[11px] text-muted-foreground">+{e.badges.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="type-readout pr-5 text-right text-sm font-semibold">{e.points}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
