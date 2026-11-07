import Link from "next/link";
import { ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NewTaskDialog } from "@/components/tasks/new-task-dialog";
import { TaskCard } from "@/components/tasks/task-card";
import { getCurrentProfile } from "@/lib/auth";
import { getAnnouncements } from "@/lib/actions/announcements";
import { PinnedAnnouncements } from "@/components/announcements/pinned-announcements";
import { getAllTasks, getTaskFormOptions, getTasksAssignedByMe, getTasksAssignedToMe } from "@/lib/actions/tasks";
import { canAssignTasks, isAdminRole, RECOGNITION_RECIPIENT_ROLES } from "@/lib/roles";
import type { MemberTask, TaskStatus } from "@/lib/types";

type View = "mine" | "assigned" | "all";

const VIEW_LABEL: Record<View, string> = {
  mine: "My tasks",
  assigned: "Assigned by me",
  all: "All tasks",
};

const COLUMNS: { status: TaskStatus; label: string; empty: string }[] = [
  { status: "pending", label: "To do", empty: "Nothing waiting." },
  { status: "in_progress", label: "In progress", empty: "Nothing in progress." },
  { status: "completed", label: "Done", empty: "Nothing finished yet." },
];

function byDueDate(a: MemberTask, b: MemberTask) {
  return (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
}

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { profile } = await getCurrentProfile();
  const { view: requested } = await searchParams;

  const canReceive = RECOGNITION_RECIPIENT_ROLES.includes(profile.role);
  const canAssign = canAssignTasks(profile.role);
  const isAdmin = isAdminRole(profile.role);

  const views: View[] = [
    ...(canReceive ? (["mine"] as View[]) : []),
    ...(canAssign ? (["assigned"] as View[]) : []),
    ...(isAdmin ? (["all"] as View[]) : []),
  ];
  const view: View = views.includes(requested as View) ? (requested as View) : (views[0] ?? "mine");

  // Tasks is the Working Committee's home page, so their pinned announcements show here.
  const isHome = profile.role === "working";
  const [tasks, options, pinned] = await Promise.all([
    view === "mine" ? getTasksAssignedToMe() : view === "assigned" ? getTasksAssignedByMe() : getAllTasks(),
    canAssign ? getTaskFormOptions() : Promise.resolve(null),
    isHome ? getAnnouncements({ pinnedOnly: true, limit: 3 }) : Promise.resolve(null),
  ]);

  const description =
    profile.role === "working"
      ? "Tasks assigned to you by the Executive and Core Committees."
      : profile.role === "core"
        ? "Your own tasks, and tasks you've assigned to Working Committee members."
        : "Assign tasks to Core and Working Committee members and follow their progress.";

  return (
    <div className="space-y-6">
      <PageHeader
        title={profile.role === "working" ? "My tasks" : "Tasks"}
        description={description}
        actions={
          canAssign && options ? (
            <NewTaskDialog members={options.members} events={options.events} myRole={profile.role} />
          ) : undefined
        }
      />

      {pinned && <PinnedAnnouncements items={pinned.items} />}

      {views.length > 1 && (
        <nav aria-label="Task views" className="inline-flex rounded-lg border bg-card p-1">
          {views.map((v) => (
            <Link
              key={v}
              href={`/tasks?view=${v}`}
              aria-current={v === view ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                v === view ? "bg-ink text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {VIEW_LABEL[v]}
            </Link>
          ))}
        </nav>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={view === "mine" ? "No tasks for you right now" : view === "assigned" ? "You haven't assigned any tasks" : "No tasks yet"}
          description={
            view === "mine"
              ? "When the Executive or Core Committee assigns you a task, it shows up here."
              : "Use “New task” to assign one."
          }
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = tasks.filter((t) => t.status === col.status).sort(byDueDate);
            return (
              <section key={col.status} aria-label={col.label} className="rounded-xl bg-muted/60 p-3">
                <header className="mb-3 flex items-center justify-between px-1">
                  <h2 className="type-eyebrow text-foreground">{col.label}</h2>
                  <span className="type-readout rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </header>
                {items.length === 0 ? (
                  <p className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                    {col.empty}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {items.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        isAssignee={t.assigned_to === profile.id}
                        canManage={t.assigned_by === profile.id || isAdmin}
                        showAssignee={view !== "mine"}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
