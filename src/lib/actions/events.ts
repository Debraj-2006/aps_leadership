"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/actions/activity";
import type { EventStatus, EventType } from "@/lib/types";

export async function getEvents(filters: {
  search?: string;
  type?: string;
  status?: string;
  tenureId?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select("*, tenure:tenures(academic_year)")
    .order("event_date", { ascending: false });

  if (filters.search) query = query.ilike("title", `%${filters.search}%`);
  if (filters.type && filters.type !== "all") query = query.eq("type", filters.type as EventType);
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status as EventStatus);
  if (filters.tenureId && filters.tenureId !== "all") query = query.eq("tenure_id", filters.tenureId);

  const { data } = await query;
  return data ?? [];
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  const title = String(formData.get("title") || "").trim();
  const type = String(formData.get("type") || "other");
  const description = String(formData.get("description") || "") || null;
  const eventDate = String(formData.get("event_date") || "");
  const venue = String(formData.get("venue") || "") || null;
  const speaker = String(formData.get("speaker") || "") || null;
  const status = String(formData.get("status") || "planned");
  const attendeesCount = Number(formData.get("attendees_count") || 0);
  const tenureId = String(formData.get("tenure_id") || "") || null;

  if (!title || !eventDate) return { error: "Title and date are required." };

  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      type,
      description,
      event_date: eventDate,
      venue,
      speaker,
      status,
      attendees_count: attendeesCount,
      tenure_id: tenureId,
      created_by: authData.user?.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await logActivity({ action: "created an event", entityType: "event", entityId: data.id, details: { title } });

  revalidatePath("/events");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = String(formData.get("title") || "").trim();
  const type = String(formData.get("type") || "other");
  const description = String(formData.get("description") || "") || null;
  const eventDate = String(formData.get("event_date") || "");
  const venue = String(formData.get("venue") || "") || null;
  const speaker = String(formData.get("speaker") || "") || null;
  const status = String(formData.get("status") || "planned");
  const attendeesCount = Number(formData.get("attendees_count") || 0);
  const tenureId = String(formData.get("tenure_id") || "") || null;

  const { error } = await supabase
    .from("events")
    .update({
      title,
      type,
      description,
      event_date: eventDate,
      venue,
      speaker,
      status,
      attendees_count: attendeesCount,
      tenure_id: tenureId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await logActivity({ action: "updated an event", entityType: "event", entityId: id, details: { title } });

  revalidatePath("/events");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { error: error.message };

  await logActivity({ action: "deleted an event", entityType: "event", entityId: id });

  revalidatePath("/events");
  revalidatePath("/dashboard");
  return { success: true };
}
