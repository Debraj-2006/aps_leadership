import Link from "next/link";
import { cn } from "cn";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { NewTaskDialog } from "@/components/tasks/new-task-dialog";
import { TaskCard } from "@/components/tasks/task-card";
import { getCurrentProfile } from "@/lib/auth";
import { getAllTasks, getTaskFormOptions, getTasksAssignedByMe, getTasksAssignedToMe } from "@/lib/actions/tasks";
import { canAssignTasks, isAdminRole, RECOGNITION_RECIPIENT_ROLES } from "@/lib/roles";
import type { MemberTask } from "@/lib/types";

type View = "mine" | "assigned" | "all";

const VIEW_LABEL: Record<View, string> = {
  mine: "My tasks",
  assigned: "Assigned by me",
  all: "All tasks",
};

const STATUS_ORDER: Record<string, number> = { in_progress: 0, pending: 1, completed: 2 };

function sortTasks(tasks: MemberTask[]) {
  return [...tasks].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999")
  );
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
  const view: View = views.includes(requested as View) ? (requested as View) : views[0] ?? "mine";

  const [tasks, options] = await Promise.all([
    view === "mine" ? getTasksAssignedToMe() : view === "assigned" ? getTasksAssignedByMe() : getAllTasks(),
    canAssign ? getTaskFormOptions() : Promise.resolve(null),
  ]);

  const sorted = sortTasks(tasks);
  const openCount = tasks.filter((t) => t.status !== "completed").length;

  const description =
    profile.role === "working"
      ? "Tasks assigned to you by the Executive and Core Committees."
      : profile.role === "core"
        ? "Your own tasks, and tasks you've assigned to Working Committee members."
        : "Assign tasks to Core and Working Committee members and track their progress.";

  return (
    <div className="space-y-6">
      <PageHeader
        title={profile.role === "working" ? "My Tasks" : "Tasks"}
        description={description}
        actions={
          canAssign && options ? (
            <NewTaskDialog members={options.members} events={options.events} myRole={profile.role} />
          ) : undefined
        }
      />

      {views.length > 1 && (
        <div className="inline-flex rounded-lg border bg-background p-1" role="tablist">
          {views.map((v) => (
            <Link
              key={v}
              href={`/tasks?view=${v}`}
              role="tab"
              aria-selected={v === view}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                v === view ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {VIEW_LABEL[v]}
            </Link>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {openCount} open · {tasks.length - openCount} done
      </p>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {view === "mine"
              ? "You have no tasks right now."
              : view === "assigned"
                ? "You haven't assigned any tasks yet. Use “New task” to assign one."
                : "No tasks have been assigned yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((t) => (
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
    </div>
  );
}
