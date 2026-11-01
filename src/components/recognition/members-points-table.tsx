import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { BadgeChip } from "@/components/recognition/badge-chip";
import { ROLE_LABELS } from "@/lib/roles";
import { initials } from "@/lib/format";
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
                    <TableCell>
                      {e.badges.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {e.badges.slice(0, 6).map((b) => (
                            <BadgeChip key={b.id} badge={b.badge} eventTitle={b.event_title} compact />
                          ))}
                          {e.badges.length > 6 && (
                            <span className="inline-flex h-7 items-center px-1 text-xs text-muted-foreground">+{e.badges.length - 6}</span>
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
