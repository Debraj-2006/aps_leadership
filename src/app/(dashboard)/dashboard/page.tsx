import Link from "next/link";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { CalendarDays, HandHeart, UserCheck, Users } from "lucide-react";
import { SkyScene, Town } from "@/components/brand/sky-scene";
import { DoraWave } from "@/components/brand/dora-wave";
import type { Readout } from "@/components/shared/readout-strip";
import { EmptyState } from "@/components/shared/empty-state";
import { DateBlock } from "@/components/shared/date-block";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getDashboardStats, getRecentEvents, getUpcomingDeadlines, getUpcomingEvents } from "@/lib/actions/dashboard";
import { getRecentActivity } from "@/lib/actions/activity";
import { getLeaderboard, getRecentRecognition } from "@/lib/actions/recognition";
import { RecognitionFeed } from "@/components/recognition/recognition-feed";
import { TopThree } from "@/components/recognition/top-three";
import { getAllTasks, getTasksAssignedToMe } from "@/lib/actions/tasks";
import { getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canApprovePendingUsers, isAdminRole, ROLE_LABELS, WORKING_HOME } from "@/lib/roles";
import { getMemberDirectory, getPendingApprovalCount } from "@/lib/actions/users";
import { getPendingPointRequestCount } from "@/lib/actions/point-requests";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
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
  if (days === -1) return "Yesterday";
  if (days < 0) return `${-days} days ago`;
  return `in ${days} days`;
}

function HeroReadouts({ items }: { items: Readout[] }) {
  return (
    <dl className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-xl bg-white/[0.06] px-4 py-3.5 ring-1 ring-white/10">
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

  const [stats, activity, deadlines, upcomingEvents, leaderboard, recentRecognition, tasks, directory, recentEvents, pendingApprovals, pendingPointRequests] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(6),
    getUpcomingDeadlines(5),
    getUpcomingEvents(5),
    getLeaderboard(),
    getRecentRecognition(5),
    isAdmin ? getAllTasks() : getTasksAssignedToMe(),
    getMemberDirectory(),
    getRecentEvents(5),
    canApprovePendingUsers(profile.role) ? getPendingApprovalCount() : Promise.resolve(0),
    canApprovePendingUsers(profile.role) ? getPendingPointRequestCount() : Promise.resolve(0),
  ]);

  const openTasks = tasks.filter((t) => t.status !== "completed").length;
  const totalPoints = leaderboard.reduce((sum, e) => sum + e.points, 0);
  // With nothing scheduled, show what the chapter did recently instead of an empty card.
  const showingPast = upcomingEvents.length === 0 && recentEvents.length > 0;
  const eventList = showingPast ? recentEvents : upcomingEvents;
  const executives = directory
    .filter((m) => m.role === "executive")
    .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""));

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-[#0b1d45] text-white">
        <div className="relative px-6 pt-7 sm:px-8 sm:pt-9">
          <SkyScene id="dashboard" town={false} />
          {/* Kept narrow so it never covers the face (which grins on hover). */}
          <div className="relative z-10 max-w-[65%] sm:max-w-[58%]">
            <p className="type-eyebrow text-trace">Overview</p>
            <h1 className="type-display mt-2 text-[1.8rem] font-bold leading-[1.08] tracking-[-0.02em] sm:text-[2.4rem]">
              Welcome back, {profile.full_name.split(" ")[0] || "there"}
            </h1>
            <p className="mt-2 text-sm text-white/75">
              {ROLE_LABELS[profile.role]}
              {profile.position ? ` · ${profile.position}` : ""}
            </p>
          </div>
          <div className="relative -mx-6 mt-4 h-20 sm:-mx-8 sm:h-28">
            <Town id="dashboard-town-back" layer="back" className="absolute inset-0 size-full" />
            <Town id="dashboard-town-front" layer="front" className="pointer-events-none absolute inset-0 size-full" />
            {/* Doraemon stands in front of the houses and waves. */}
            <DoraWave className="absolute right-2 -bottom-1 w-28 sm:right-[15%] sm:w-36 lg:w-40" />
          </div>
        </div>
        <div className="px-6 pt-1 pb-6 sm:px-8">
          <HeroReadouts
            items={[
              { label: "Committee", value: stats.committeeCount, hint: "Executive & core" },
              { label: "Members", value: stats.totalMembers, hint: "Registered accounts" },
              { label: "Events held", value: stats.completedEvents, hint: `${stats.plannedEvents} planned` },
              { label: "Open tasks", value: openTasks, hint: isAdmin ? "Across the chapter" : "Assigned to you" },
              { label: "Points given", value: totalPoints, hint: "Across all members" },
              {
                label: "Documents",
                value: stats.totalDocuments,
                hint: `${stats.pendingHandovers} handover${stats.pendingHandovers === 1 ? "" : "s"} open`,
              },
            ]}
          />
        </div>
        <div className="h-2 bg-collar" aria-hidden="true" />
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

      {pendingPointRequests > 0 && (
        <Link
          href="/recognition"
          className="group flex items-center gap-4 rounded-xl border border-trace/50 bg-trace/10 px-5 py-4 transition-colors hover:bg-trace/15"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-trace text-ink">
            <HandHeart className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {pendingPointRequests} point request{pendingPointRequests === 1 ? "" : "s"} to review
            </p>
            <p className="text-sm text-muted-foreground">Members asked to recognise a teammate. Points are added once you approve.</p>
          </div>
          <span className="text-sm font-medium text-primary group-hover:underline">Review</span>
        </Link>
      )}

      <TopThree entries={leaderboard} currentUserId={profile.id} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{showingPast ? "Recent events" : "Upcoming events"}</CardTitle>
            <CardAction>
              <SectionLink href="/events">All events</SectionLink>
            </CardAction>
          </CardHeader>
          <CardContent>
            {eventList.length === 0 ? (
              <EmptyState compact icon={CalendarDays} title="Nothing scheduled" description="Planned events will show up here." />
            ) : (
              <>
                {showingPast && (
                  <p className="mb-3 text-xs text-muted-foreground">Nothing is scheduled yet. Here&apos;s what the chapter did lately.</p>
                )}
                <ul className="divide-y">
                  {eventList.map((e) => (
                    <li key={e.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <DateBlock date={e.event_date} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{e.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {EVENT_TYPE_LABEL[e.type] ?? "Event"}
                          {e.venue && !/^(na|n\/a|-)$/i.test(e.venue.trim()) ? ` · ${e.venue}` : ""}
                        </p>
                      </div>
                      <span className="type-readout shrink-0 text-xs text-muted-foreground">{relativeDay(parseISO(e.event_date))}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent recognition</CardTitle>
            <CardAction>
              <SectionLink href={isAdmin ? "/recognition" : "/my-recognition"}>
                {isAdmin ? "Points & badges" : "My points"}
              </SectionLink>
            </CardAction>
          </CardHeader>
          <CardContent>
            <RecognitionFeed items={recentRecognition} />
          </CardContent>
        </Card>
      </div>

      <div className={cn("grid grid-cols-1 gap-6", deadlines.length > 0 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
        <Card>
          <CardHeader>
            <CardTitle>Executive Committee</CardTitle>
            <CardAction>
              <SectionLink href="/leadership">Leadership</SectionLink>
            </CardAction>
          </CardHeader>
          <CardContent>
            {executives.length === 0 ? (
              <EmptyState compact icon={Users} title="No executives yet" description="Approved executive accounts show up here." />
            ) : (
              <ul className="space-y-3">
                {executives.slice(0, 6).map((m) => (
                  <li key={m.id} className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-ink text-[11px] font-medium text-white">{initials(m.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.full_name}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.position || ROLE_LABELS[m.role]}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {deadlines.length > 0 && (
          <UpcomingDeadlines
            deadlines={deadlines as (HandoverTask & { handover_record?: { designation?: { title: string } | null } | null })[]}
          />
        )}

        <RecentActivity
          activity={activity as (ActivityLog & { actor?: Pick<Profile, "full_name" | "role"> | null })[]}
          showAllLink={isAdmin}
        />
      </div>
    </div>
  );
}
