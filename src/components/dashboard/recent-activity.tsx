import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ScrollText } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { initials } from "@/lib/format";
import type { ActivityLog, Profile } from "@/lib/types";

export function RecentActivity({
  activity,
  showAllLink = false,
}: {
  activity: (ActivityLog & { actor?: Pick<Profile, "full_name" | "role"> | null })[];
  showAllLink?: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        {showAllLink && (
          <CardAction>
            <Link href="/admin/activity" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
              Activity log
            </Link>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <EmptyState compact icon={ScrollText} title="No activity yet" />
        ) : (
          <ul className="space-y-4">
            {activity.map((log) => {
              const name = log.actor?.full_name ?? "System";
              return (
                <li key={log.id} className="flex items-start gap-3">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-[10px] font-medium">{initials(name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">
                      <span className="font-medium">{name}</span>{" "}
                      <span className="text-muted-foreground">{log.action}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
