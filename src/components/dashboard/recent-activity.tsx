import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { ActivityLog, Profile } from "@/lib/types";

export function RecentActivity({
  activity,
}: {
  activity: (ActivityLog & { actor?: Pick<Profile, "full_name" | "role"> | null })[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activity.length === 0 && (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        )}
        {activity.map((log) => {
          const name = log.actor?.full_name ?? "System";
          const initials = name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <div key={log.id} className="flex items-start gap-3">
              <Avatar className="size-8">
                <AvatarFallback className="text-[11px] font-medium">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm">
                  <span className="font-medium">{name}</span>{" "}
                  <span className="text-muted-foreground">{log.action}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
