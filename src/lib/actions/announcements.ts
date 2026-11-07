"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { logActivity } from "@/lib/actions/activity";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author: { full_name: string; position: string | null; avatar_url: string | null } | null;
}

const NOT_READY =
  "Announcements aren't switched on yet. Run the 0013 database update in Supabase, then try again.";

// The table only exists once migration 0013 has been run.
function isMissingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    (/announcements/.test(error.message ?? "") && /does not exist|schema cache/.test(error.message ?? ""))
  );
}

function refresh() {
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
}

async function requireAdmin() {
  const me = await getSessionProfile();
  if (!me || !isAdminRole(me.role)) return null;
  return me;
}

function readForm(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const isPinned = formData.get("is_pinned") === "on";
  if (title.length < 3) return { error: "Give the announcement a title of at least 3 characters." };
  if (title.length > 120) return { error: "Keep the title under 120 characters." };
  if (!body) return { error: "Write the announcement before posting it." };
  if (body.length > 2000) return { error: "Keep the announcement under 2,000 characters." };
  return { title, body, isPinned };
}

export async function getAnnouncements({
  pinnedOnly = false,
  limit,
}: { pinnedOnly?: boolean; limit?: number } = {}): Promise<{ items: Announcement[]; ready: boolean }> {
  const supabase = await createClient();
  let query = supabase
    .from("announcements")
    .select("id, title, body, is_pinned, created_at, updated_at, author:profiles(full_name, position, avatar_url)")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (pinnedOnly) query = query.eq("is_pinned", true);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) return { items: [], ready: !isMissingTable(error) };
  return { items: (data ?? []) as unknown as Announcement[], ready: true };
}

export async function createAnnouncement(formData: FormData) {
  const me = await requireAdmin();
  if (!me) return { error: "Only Executives can post announcements." };
  const form = readForm(formData);
  if ("error" in form) return { error: form.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .insert({ title: form.title, body: form.body, is_pinned: form.isPinned, created_by: me.id })
    .select("id")
    .single();
  if (error) return { error: isMissingTable(error) ? NOT_READY : error.message };

  const { data: members } = await supabase.from("profiles").select("id").eq("is_active", true).neq("id", me.id);
  if (members && members.length > 0) {
    await supabase.from("notifications").insert(
      members.map((m) => ({
        recipient_id: m.id,
        title: `New announcement: ${form.title}`,
        message: `${me.full_name} posted an announcement.`,
        type: "info" as const,
        link: "/announcements",
      }))
    );
  }

  await logActivity({ action: `posted an announcement: ${form.title}`, entityType: "announcement", entityId: data.id, actorId: me.id });
  refresh();
  return { success: true };
}

export async function updateAnnouncement(id: string, formData: FormData) {
  const me = await requireAdmin();
  if (!me) return { error: "Only Executives can edit announcements." };
  const form = readForm(formData);
  if ("error" in form) return { error: form.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .update({ title: form.title, body: form.body, is_pinned: form.isPinned, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: isMissingTable(error) ? NOT_READY : error.message };

  await logActivity({ action: `edited an announcement: ${form.title}`, entityType: "announcement", entityId: id, actorId: me.id });
  refresh();
  return { success: true };
}

export async function setAnnouncementPinned(id: string, pinned: boolean) {
  const me = await requireAdmin();
  if (!me) return { error: "Only Executives can pin announcements." };
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").update({ is_pinned: pinned }).eq("id", id);
  if (error) return { error: error.message };
  refresh();
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  const me = await requireAdmin();
  if (!me) return { error: "Only Executives can delete announcements." };
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity({ action: "deleted an announcement", entityType: "announcement", entityId: id, actorId: me.id });
  refresh();
  return { success: true };
}
