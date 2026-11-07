import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ScrollText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { getRecentActivity } from "@/lib/actions/activity";
import { getCurrentProfile } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

export default async function ActivityLogPage() {
  const { profile } = await getCurrentProfile();
  if (!isAdminRole(profile.role)) redirect("/dashboard");

  const activity = await getRecentActivity(50);

  return (
    <div className="space-y-6">
      <PageHeader title="Activity log" description="The latest 50 actions taken across the chapter hub, newest first." />

      {activity.length === 0 ? (
        <EmptyState icon={ScrollText} title="No activity recorded yet" />
      ) : (
        <Card className="py-0">
          <ul className="divide-y">
            {activity.map((log) => {
              const name = log.actor?.full_name ?? "System";
              return (
                <li key={log.id} className="flex items-center gap-3 px-5 py-3">
                  <MemberAvatar name={name} src={log.actor?.avatar_url} className="size-8" fallbackClassName="text-[11px] font-medium" />
                  <p className="min-w-0 flex-1 text-sm">
                    <span className="font-medium">{name}</span> <span className="text-muted-foreground">{log.action}</span>
                  </p>
                  <span className="type-eyebrow hidden shrink-0 text-[10px] text-muted-foreground sm:inline">
                    {log.entity_type.replace("_", " ")}
                  </span>
                  <time className="type-readout shrink-0 text-right text-xs text-muted-foreground sm:w-36" dateTime={log.created_at}>
                    {format(new Date(log.created_at), "dd MMM yyyy, HH:mm")}
                  </time>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
