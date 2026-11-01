import Link from "next/link";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { CalendarDays, Trophy, UserCheck, Users } from "lucide-react";
import { PropagationArt } from "@/components/brand/propagation-art";
import type { Readout } from "@/components/shared/readout-strip";
import { EmptyState } from "@/components/shared/empty-state";
import { DateBlock } from "@/components/shared/date-block";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { MeterBar } from "@/components/recognition/meter-bar";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getDashboardStats, getUpcomingDeadlines, getUpcomingEvents } from "@/lib/actions/dashboard";
import { getRecentActivity } from "@/lib/actions/activity";
import { getLeaderboard } from "@/lib/actions/recognition";
import { getAllTasks, getTasksAssignedToMe } from "@/lib/actions/tasks";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { canApprovePendingUsers, isAdminRole, ROLE_LABELS, WORKING_HOME } from "@/lib/roles";
import { getPendingApprovalCount } from "@/lib/actions/users";
import { initials, shortAcademicYear } from "@/lib/format";
import type { ActivityLog, HandoverTask, Profile } from "@/lib/types";

const EVENT_TYPE_LABEL: Record<string, string> = {
  technical_talk: "Technical talk",
  workshop: "Workshop",
  webinar: "Webinar",
  competition: "Competition",
  seminar: "Seminar",
  social: "Social",
  other: "Event",
};

function relativeDay(date: Date) {
  const days = differenceInCalendarDays(date, new Date());
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
}

function HeroReadouts({ items }: { items: Readout[] }) {
  return (
    <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/12 md:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 bg-ink/85 px-4 py-3.5 backdrop-blur-sm">
          <dt className="type-eyebrow truncate text-[10px] text-white/55">{item.label}</dt>
          <dd className="type-display mt-1.5 truncate text-2xl leading-none font-bold tabular-nums">{item.value}</dd>
          {item.hint && <dd className="mt-1.5 truncate text-xs text-white/55">{item.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}

function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-xs font-medium text-primary underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

export default async function DashboardPage() {
  const { profile } = await getCurrentProfile();
  // Sign-in redirects here from a server action, which renders without passing back
  // through the middleware's Working Committee check.
  if (profile.role === "working") redirect(WORKING_HOME);
  const isAdmin = isAdminRole(profile.role);
  const supabase = await createClient();

  const [stats, activity, deadlines, upcomingEvents, leaderboard, tasks, { data: currentCommittee }, pendingApprovals] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(6),
    getUpcomingDeadlines(5),
    getUpcomingEvents(5),
    getLeaderboard(),
    isAdmin ? getAllTasks() : getTasksAssignedToMe(),
    supabase
      .from("committee_members")
      .select("*, profile:profiles(full_name, role), designation:designations(title, rank), tenure:tenures!inner(status)")
      .eq("tenure.status", "active")
      .order("rank", { foreignTable: "designations", ascending: true })
      .limit(6),
    canApprovePendingUsers(profile.role) ? getPendingApprovalCount() : Promise.resolve(0),
  ]);

  const openTasks = tasks.filter((t) => t.status !== "completed").length;
  const contributors = leaderboard.filter((e) => e.points > 0 || e.badges.length > 0).slice(0, 5);
  const topPoints = Math.max(...contributors.map((e) => e.points), 0);
  const tenure = stats.activeTenure;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-ink text-white">
        <div className="pointer-events-none absolute -top-4 right-0 size-36 sm:right-4 sm:size-56 lg:size-72">
          <PropagationArt id="dashboard" className="size-full" />
        </div>
        <div className="relative z-10 px-6 pt-7 pb-6 sm:px-8 sm:pt-8">
          <p className="type-eyebrow text-trace">Overview</p>
          <h1 className="type-display mt-2 max-w-[70%] text-[1.8rem] font-bold leading-[1.08] tracking-[-0.02em] sm:text-[2.4rem]">
            Welcome back, {profile.full_name.split(" ")[0] || "there"}
          </h1>
          <p className="mt-2 text-sm text-white/70">
            {ROLE_LABELS[profile.role]}
            {profile.position ? ` · ${profile.position}` : ""}
          </p>
          <HeroReadouts
            items={[
          {
            label: "Tenure",
            value: tenure ? shortAcademicYear(tenure.academic_year) : "—",
            hint: tenure
              ? `${format(parseISO(tenure.start_date), "MMM yyyy")} – ${format(parseISO(tenure.end_date), "MMM yyyy")}`
              : "No active tenure",
          },
          { label: "Committee", value: stats.committeeCount, hint: "Serving this tenure" },
          { label: "Members", value: stats.totalMembers, hint: "Registered accounts" },
          { label: "Events held", value: stats.completedEvents, hint: `${stats.plannedEvents} planned` },
          { label: "Open tasks", value: openTasks, hint: isAdmin ? "Across the chapter" : "Assigned to you" },
          {
            label: "Documents",
            value: stats.totalDocuments,
            hint: `${stats.pendingHandovers} handover${stats.pendingHandovers === 1 ? "" : "s"} open`,
          },
            ]}
          />
        </div>
      </section>

      {pendingApprovals > 0 && (
        <Link
          href="/admin/users"
          className="group flex items-center gap-4 rounded-xl border border-trace/50 bg-trace/10 px-5 py-4 transition-colors hover:bg-trace/15"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-trace text-ink">
            <UserCheck className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {pendingApprovals} {pendingApprovals === 1 ? "person is" : "people are"} waiting for approval
            </p>
            <p className="text-sm text-muted-foreground">They can&apos;t sign in until an Executive approves them.</p>
          </div>
          <span className="text-sm font-medium text-primary group-hover:underline">Review</span>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming events</CardTitle>
            <CardAction>
              <SectionLink href="/events">All events</SectionLink>
            </CardAction>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <EmptyState compact icon={CalendarDays} title="Nothing scheduled" description="Planned events will show up here." />
            ) : (
              <ul className="divide-y">
                {upcomingEvents.map((e) => {
                  const date = parseISO(e.event_date);
                  return (
                    <li key={e.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <DateBlock date={e.event_date} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{e.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {EVENT_TYPE_LABEL[e.type] ?? "Event"}
                          {e.venue ? ` · ${e.venue}` : ""}
                        </p>
                      </div>
                      <span className="type-readout shrink-0 text-xs text-muted-foreground">{relativeDay(date)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top contributors</CardTitle>
            <CardAction>
              <SectionLink href="/leaderboard">Leaderboard</SectionLink>
            </CardAction>
          </CardHeader>
          <CardContent>
            {contributors.length === 0 ? (
              <EmptyState
                compact
                icon={Trophy}
                title="No points given yet"
                description={isAdmin ? "Give points from the Leaderboard to start the rankings." : "Rankings appear once points are given."}
              />
            ) : (
              <ol className="space-y-4">
                {contributors.map((e) => (
                  <li key={e.profile_id} className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3">
                    <span className="type-readout text-xs text-muted-foreground">{e.rank}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.full_name}</p>
                      <MeterBar value={e.points} max={topPoints} className="mt-1.5" />
                    </div>
                    <span className="type-readout text-sm font-medium">{e.points}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current committee</CardTitle>
            <CardAction>
              <SectionLink href="/leadership">Roster</SectionLink>
            </CardAction>
          </CardHeader>
          <CardContent>
            {!currentCommittee || currentCommittee.length === 0 ? (
              <EmptyState
                compact
                icon={Users}
                title={tenure ? "No members assigned" : "No active tenure"}
                description={tenure ? "Add members from the Leadership page." : "Set an active tenure on the Tenure page."}
              />
            ) : (
              <ul className="space-y-3">
                {currentCommittee.map((m) => (
                  <li key={m.id} className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-[11px] font-medium">{initials(m.profile?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.profile?.full_name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {m.custom_title || m.designation?.title}
                        {" · "}
                        {ROLE_LABELS[(m.profile?.role as Profile["role"]) ?? "working"]}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <UpcomingDeadlines
          deadlines={deadlines as (HandoverTask & { handover_record?: { designation?: { title: string } | null } | null })[]}
        />

        <RecentActivity
          activity={activity as (ActivityLog & { actor?: Pick<Profile, "full_name" | "role"> | null })[]}
          showAllLink={isAdmin}
        />
      </div>
    </div>
  );
}
