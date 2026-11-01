import Link from "next/link";
import {
  Users,
  CalendarRange,
  CalendarCheck2,
  ListTodo,
  FileText,
  ArrowLeftRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getUpcomingDeadlines, getUpcomingEvents } from "@/lib/actions/dashboard";
import { getRecentActivity } from "@/lib/actions/activity";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS } from "@/lib/roles";
import { format } from "date-fns";
import type { ActivityLog, HandoverTask, Profile } from "@/lib/types";

export default async function DashboardPage() {
  const { profile } = await getCurrentProfile();
  const supabase = await createClient();

  const [stats, activity, deadlines, upcomingEvents] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(6),
    getUpcomingDeadlines(5),
    getUpcomingEvents(4),
  ]);

  const { data: currentCommittee } = stats.activeTenure
    ? await supabase
        .from("committee_members")
        .select("*, profile:profiles(full_name, role), designation:designations(title, rank)")
        .eq("tenure_id", stats.activeTenure.id)
        .order("rank", { foreignTable: "designations", ascending: true })
        .limit(6)
    : { data: [] };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${profile.full_name.split(" ")[0]}`}
        description={`${ROLE_LABELS[profile.role]} · IEEE AP-S Student Branch Chapter, IEM`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Active Tenure"
          value={stats.activeTenure?.academic_year ?? "—"}
          icon={CalendarRange}
          hint={stats.activeTenure ? "Current academic year" : "No active tenure set"}
          tone="primary"
        />
        <StatCard
          label="Current Committee"
          value={stats.committeeCount}
          icon={Users}
          hint="Executive members serving"
          tone="accent"
        />
        <StatCard
          label="Total Members"
          value={stats.totalMembers}
          icon={Users}
          hint="All-time registered users"
        />
        <StatCard
          label="Completed Events"
          value={stats.completedEvents}
          icon={CalendarCheck2}
          hint={`${stats.plannedEvents} upcoming`}
          tone="success"
        />
        <StatCard
          label="Pending Tasks"
          value={stats.pendingTasks}
          icon={ListTodo}
          hint="Across active handovers"
          tone="warning"
        />
        <StatCard
          label="Documents"
          value={stats.totalDocuments}
          icon={FileText}
          hint={`${stats.pendingHandovers} handover(s) in progress`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Current Committee</CardTitle>
            <Button nativeButton={false} render={<Link href="/leadership" />} variant="ghost" size="sm">
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(!currentCommittee || currentCommittee.length === 0) && (
              <p className="text-sm text-muted-foreground">
                No active tenure configured yet. Set one up in Tenure Management.
              </p>
            )}
            {currentCommittee?.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{m.profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.custom_title || m.designation?.title}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {ROLE_LABELS[(m.profile?.role as Profile["role"]) ?? "working"]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-1">
          <UpcomingDeadlines deadlines={deadlines as (HandoverTask & { handover_record?: { designation?: { title: string } | null } | null })[]} />
        </div>

        <div className="lg:col-span-1">
          <RecentActivity activity={activity as (ActivityLog & { actor?: Pick<Profile, "full_name" | "role"> | null })[]} />
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Upcoming Events</CardTitle>
          <Button nativeButton={false} render={<Link href="/events" />} variant="ghost" size="sm">
            View all
          </Button>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events scheduled.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="rounded-lg border p-3">
                  <Badge variant="secondary" className="mb-2 capitalize">
                    {e.type.replace("_", " ")}
                  </Badge>
                  <p className="text-sm font-medium leading-tight">{e.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(e.event_date), "dd MMM yyyy")}
                    {e.venue ? ` · ${e.venue}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button nativeButton={false} render={<Link href="/handover" />} variant="outline" size="sm">
          <ArrowLeftRight className="size-4" /> Go to Handover Center
        </Button>
        <Button nativeButton={false} render={<Link href="/archive" />} variant="outline" size="sm">
          <CalendarRange className="size-4" /> Browse Historical Archive
        </Button>
      </div>
    </div>
  );
}
