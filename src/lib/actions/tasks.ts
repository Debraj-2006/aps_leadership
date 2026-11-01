"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/actions/activity";
import { assignableRolesFor, isAdminRole } from "@/lib/roles";
import { getSessionProfile } from "@/lib/auth";
import type { MemberTask, TaskPriority, TaskStatus, UserRole } from "@/lib/types";

const TASK_SELECT =
  "*, assignee:profiles!member_tasks_assigned_to_fkey(full_name, role), assigner:profiles!member_tasks_assigned_by_fkey(full_name, role), event:events(title)";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];
const STATUSES: TaskStatus[] = ["pending", "in_progress", "completed"];

async function getMe() {
  const me = await getSessionProfile();
  if (!me) return null;
  const supabase = await createClient();
  return { supabase, id: me.id, role: me.role as UserRole, name: me.full_name };
}

function revalidateTasks() {
  revalidatePath("/tasks");
}

export async function getTasksAssignedToMe(): Promise<MemberTask[]> {
  const me = await getMe();
  if (!me) return [];
  const { data } = await me.supabase
    .from("member_tasks")
    .select(TASK_SELECT)
    .eq("assigned_to", me.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as MemberTask[];
}

export async function getTasksAssignedByMe(): Promise<MemberTask[]> {
  const me = await getMe();
  if (!me) return [];
  const { data } = await me.supabase
    .from("member_tasks")
    .select(TASK_SELECT)
    .eq("assigned_by", me.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as MemberTask[];
}

export async function getAllTasks(): Promise<MemberTask[]> {
  const me = await getMe();
  if (!me || !isAdminRole(me.role)) return [];
  const { data } = await me.supabase.from("member_tasks").select(TASK_SELECT).order("created_at", { ascending: false });
  return (data ?? []) as MemberTask[];
}

export async function getTaskFormOptions() {
  const me = await getMe();
  if (!me) return { members: [], events: [] };
  const roles = assignableRolesFor(me.role);
  if (roles.length === 0) return { members: [], events: [] };

  const [{ data: members }, { data: events }] = await Promise.all([
    me.supabase.from("profiles").select("id, full_name, email, role").in("role", roles).order("full_name"),
    me.supabase.from("events").select("id, title, event_date").order("event_date", { ascending: false }),
  ]);
  return {
    members: (members ?? []) as { id: string; full_name: string; email: string; role: UserRole }[],
    events: (events ?? []) as { id: string; title: string; event_date: string }[],
  };
}

export async function createTask(formData: FormData) {
  const me = await getMe();
  if (!me) return { error: "You must be signed in." };

  const allowedRoles = assignableRolesFor(me.role);
  if (allowedRoles.length === 0) return { error: "Your role can't assign tasks." };

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const assignedTo = String(formData.get("assigned_to") || "");
  const rawEvent = String(formData.get("event_id") || "");
  const eventId = rawEvent && rawEvent !== "none" ? rawEvent : null;
  const dueDate = String(formData.get("due_date") || "") || null;
  const priority = String(formData.get("priority") || "medium") as TaskPriority;

  if (!title) return { error: "Give the task a title." };
  if (!assignedTo) return { error: "Choose who the task is for." };
  if (!PRIORITIES.includes(priority)) return { error: "Invalid priority." };

  const { data: assignee } = await me.supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", assignedTo)
    .single();
  if (!assignee || !allowedRoles.includes(assignee.role as UserRole)) {
    return {
      error:
        me.role === "core"
          ? "Core Committee members can only assign tasks to Working Committee members."
          : "Tasks can only be assigned to Core or Working Committee members.",
    };
  }

  const { data, error } = await me.supabase
    .from("member_tasks")
    .insert({
      title,
      description,
      assigned_to: assignedTo,
      assigned_by: me.id,
      event_id: eventId,
      due_date: dueDate,
      priority,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await me.supabase.from("notifications").insert({
    recipient_id: assignedTo,
    title: "New task assigned to you",
    message: `${me.name} assigned you: ${title}${dueDate ? ` (due ${dueDate})` : ""}`,
    type: "deadline",
    link: "/tasks",
  });

  await logActivity({
    action: `assigned a task to ${assignee.full_name}`,
    entityType: "task",
    entityId: data.id,
    details: { title },
  });

  revalidateTasks();
  return { success: true };
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const me = await getMe();
  if (!me) return { error: "You must be signed in." };
  if (!STATUSES.includes(status)) return { error: "Invalid status." };

  const { data: task } = await me.supabase
    .from("member_tasks")
    .select("id, title, assigned_to, assigned_by, status")
    .eq("id", id)
    .single();
  if (!task) return { error: "Task not found." };

  const isAssignee = task.assigned_to === me.id;
  const isAssigner = task.assigned_by === me.id;
  if (!isAssignee && !isAssigner && !isAdminRole(me.role)) {
    return { error: "You can't update this task." };
  }

  const { error } = await me.supabase
    .from("member_tasks")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  if (isAssignee && status === "completed" && task.assigned_by) {
    await me.supabase.from("notifications").insert({
      recipient_id: task.assigned_by,
      title: "Task completed",
      message: `${me.name} completed: ${task.title}`,
      type: "info",
      link: "/tasks?view=assigned",
    });
  }
  if (!isAssignee && task.status === "completed" && status !== "completed") {
    await me.supabase.from("notifications").insert({
      recipient_id: task.assigned_to,
      title: "Task reopened",
      message: `${me.name} reopened: ${task.title}`,
      type: "deadline",
      link: "/tasks",
    });
  }

  await logActivity({
    action: `marked a task as ${status.replace("_", " ")}`,
    entityType: "task",
    entityId: id,
    details: { title: task.title },
  });

  revalidateTasks();
  return { success: true };
}

export async function deleteTask(id: string) {
  const me = await getMe();
  if (!me) return { error: "You must be signed in." };

  const { data: task } = await me.supabase.from("member_tasks").select("title, assigned_by").eq("id", id).single();
  if (!task) return { error: "Task not found." };
  if (task.assigned_by !== me.id && !isAdminRole(me.role)) {
    return { error: "Only the person who assigned this task can delete it." };
  }

  const { error } = await me.supabase.from("member_tasks").delete().eq("id", id);
  if (error) return { error: error.message };

  await logActivity({ action: "deleted a task", entityType: "task", entityId: id, details: { title: task.title } });
  revalidateTasks();
  return { success: true };
}
