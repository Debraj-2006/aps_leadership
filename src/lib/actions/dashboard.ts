"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();

  const [
    { count: committeeCount },
    { count: totalMembers },
    { count: completedEvents },
    { count: plannedEvents },
    { count: pendingTasks },
    { count: totalDocuments },
    { count: pendingHandovers },
  ] = await Promise.all([
    supabase.from("committee_members").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "planned"),
    supabase.from("handover_tasks").select("*", { count: "exact", head: true }).neq("status", "completed"),
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase.from("handover_records").select("*", { count: "exact", head: true }).in("status", ["pending", "in_progress"]),
  ]);

  return {
    committeeCount: committeeCount ?? 0,
    totalMembers: totalMembers ?? 0,
    completedEvents: completedEvents ?? 0,
    plannedEvents: plannedEvents ?? 0,
    pendingTasks: pendingTasks ?? 0,
    totalDocuments: totalDocuments ?? 0,
    pendingHandovers: pendingHandovers ?? 0,
  };
}

export async function getUpcomingDeadlines(limit = 6) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("handover_tasks")
    .select("*, handover_record:handover_records(id, designation:designations(title))")
    .neq("status", "completed")
    .gte("due_date", today)
    .order("due_date", { ascending: true })
    .limit(limit);

  return data ?? [];
}

export async function getUpcomingEvents(limit = 5) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(limit);

  return data ?? [];
}
