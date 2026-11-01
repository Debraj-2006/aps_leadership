import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getRecentActivity } from "@/lib/actions/activity";
import { getCurrentProfile } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export default async function ActivityLogPage() {
  const { profile } = await getCurrentProfile();
  if (!isAdminRole(profile.role)) redirect("/dashboard");

  const activity = await getRecentActivity(50);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="A full audit trail of actions taken across the chapter's administration platform."
      />
      <Card>
        <CardContent className="divide-y pt-6">
          {activity.length === 0 && (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          )}
          {activity.map((log) => {
            const name = log.actor?.full_name ?? "System";
            const initials = name
              .split(" ")
              .map((p: string) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <div key={log.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar className="size-8">
                  <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{name}</span>{" "}
                    <span className="text-muted-foreground">{log.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(log.created_at), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 capitalize">
                  {log.entity_type.replace("_", " ")}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
