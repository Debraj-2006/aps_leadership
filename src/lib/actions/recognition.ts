"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/actions/activity";
import { BADGES, CUSTOM_BADGE_MAX, customBadgeKey, getBadge } from "@/lib/badges";
import { canAwardRecognition, RECOGNITION_RECIPIENT_ROLES } from "@/lib/roles";
import { getAuthUser } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export interface LeaderboardBadge {
  id: string;
  badge: string;
  event_title: string | null;
  note: string | null;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  profile_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  points: number;
  badges: LeaderboardBadge[];
}

export interface RecognitionFeedItem {
  id: string;
  kind: "points" | "badge";
  recipient_name: string;
  awarder_name: string | null;
  event_title: string | null;
  points?: number;
  badge?: string;
  text: string | null;
  created_at: string;
}

type Name = { full_name: string } | null;
type EventRef = { title: string } | null;

async function requireAwarder() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "You must be signed in." as const };

  const { data: me } = await supabase.from("profiles").select("role, full_name").eq("id", authData.user.id).single();
  if (!me || !canAwardRecognition(me.role as UserRole)) {
    return { error: "Only Executive Committee members can give points and badges." as const };
  }
  return { supabase, userId: authData.user.id, myName: me.full_name as string };
}

async function requireRecipient(supabase: Awaited<ReturnType<typeof createClient>>, recipientId: string) {
  const { data: recipient } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", recipientId)
    .single();
  if (!recipient || !RECOGNITION_RECIPIENT_ROLES.includes(recipient.role as UserRole)) {
    return null;
  }
  return recipient as { id: string; full_name: string; role: UserRole };
}

function revalidateRecognition() {
  revalidatePath("/recognition");
  revalidatePath("/my-recognition");
  revalidatePath("/dashboard");
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();

  const [{ data: members }, { data: points }, { data: badges }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, role").in("role", RECOGNITION_RECIPIENT_ROLES),
    supabase.from("point_awards").select("recipient_id, points"),
    supabase
      .from("badge_awards")
      .select("id, recipient_id, badge, note, created_at, event:events(title)")
      .order("created_at", { ascending: false }),
  ]);

  const totals = new Map<string, number>();
  for (const p of points ?? []) totals.set(p.recipient_id, (totals.get(p.recipient_id) ?? 0) + p.points);

  const badgeMap = new Map<string, LeaderboardBadge[]>();
  for (const b of badges ?? []) {
    const list = badgeMap.get(b.recipient_id) ?? [];
    list.push({
      id: b.id,
      badge: b.badge,
      note: b.note,
      created_at: b.created_at,
      event_title: (b.event as unknown as EventRef)?.title ?? null,
    });
    badgeMap.set(b.recipient_id, list);
  }

  const rows = (members ?? []).map((m) => ({
    profile_id: m.id,
    full_name: m.full_name || m.email,
    email: m.email,
    role: m.role as UserRole,
    points: totals.get(m.id) ?? 0,
    badges: badgeMap.get(m.id) ?? [],
  }));

  rows.sort(
    (a, b) => b.points - a.points || b.badges.length - a.badges.length || a.full_name.localeCompare(b.full_name)
  );

  // Members with the same points and badge count share a rank (1, 2, 2, 4 ...).
  const ranked: LeaderboardEntry[] = [];
  rows.forEach((row, i) => {
    const prev = ranked[i - 1];
    const tied = prev && prev.points === row.points && prev.badges.length === row.badges.length;
    ranked.push({ ...row, rank: tied ? prev.rank : i + 1 });
  });
  return ranked;
}

export async function getRecentRecognition(limit = 15): Promise<RecognitionFeedItem[]> {
  const supabase = await createClient();

  const [{ data: points }, { data: badges }] = await Promise.all([
    supabase
      .from("point_awards")
      .select(
        "id, points, reason, created_at, event:events(title), recipient:profiles!point_awards_recipient_id_fkey(full_name), awarder:profiles!point_awards_awarded_by_fkey(full_name)"
      )
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("badge_awards")
      .select(
        "id, badge, note, created_at, event:events(title), recipient:profiles!badge_awards_recipient_id_fkey(full_name), awarder:profiles!badge_awards_awarded_by_fkey(full_name)"
      )
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const items: RecognitionFeedItem[] = [
    ...(points ?? []).map((p) => ({
      id: p.id,
      kind: "points" as const,
      points: p.points,
      text: p.reason,
      created_at: p.created_at,
      event_title: (p.event as unknown as EventRef)?.title ?? null,
      recipient_name: (p.recipient as unknown as Name)?.full_name ?? "Former member",
      awarder_name: (p.awarder as unknown as Name)?.full_name ?? null,
    })),
    ...(badges ?? []).map((b) => ({
      id: b.id,
      kind: "badge" as const,
      badge: b.badge,
      text: b.note,
      created_at: b.created_at,
      event_title: (b.event as unknown as EventRef)?.title ?? null,
      recipient_name: (b.recipient as unknown as Name)?.full_name ?? "Former member",
      awarder_name: (b.awarder as unknown as Name)?.full_name ?? null,
    })),
  ];

  return items.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
}

export async function getMyRecognition() {
  const user = await getAuthUser();
  if (!user) return { points: 0, pointHistory: [], badges: [] };
  const supabase = await createClient();
  const userId = user.id;

  const [{ data: points }, { data: badges }] = await Promise.all([
    supabase
      .from("point_awards")
      .select("id, points, reason, created_at, event:events(title), awarder:profiles!point_awards_awarded_by_fkey(full_name)")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("badge_awards")
      .select("id, badge, note, created_at, event:events(title), awarder:profiles!badge_awards_awarded_by_fkey(full_name)")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const pointHistory = (points ?? []).map((p) => ({
    id: p.id as string,
    points: p.points as number,
    reason: p.reason as string,
    created_at: p.created_at as string,
    event_title: (p.event as unknown as EventRef)?.title ?? null,
    awarder_name: (p.awarder as unknown as Name)?.full_name ?? null,
  }));

  return {
    points: pointHistory.reduce((sum, p) => sum + p.points, 0),
    pointHistory,
    badges: (badges ?? []).map((b) => ({
      id: b.id as string,
      badge: b.badge as string,
      note: b.note as string | null,
      created_at: b.created_at as string,
      event_title: (b.event as unknown as EventRef)?.title ?? null,
      awarder_name: (b.awarder as unknown as Name)?.full_name ?? null,
    })),
  };
}

export async function getRecognitionOptions() {
  const supabase = await createClient();
  const [{ data: members }, { data: events }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("role", RECOGNITION_RECIPIENT_ROLES)
      .order("full_name"),
    supabase.from("events").select("id, title, event_date").order("event_date", { ascending: false }),
  ]);
  return {
    members: (members ?? []) as { id: string; full_name: string; email: string; role: UserRole }[],
    events: (events ?? []) as { id: string; title: string; event_date: string }[],
  };
}

export async function awardPoints(formData: FormData) {
  const ctx = await requireAwarder();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase, userId, myName } = ctx;

  const recipientId = String(formData.get("recipient_id") || "");
  const points = Number(formData.get("points"));
  const reason = String(formData.get("reason") || "").trim();
  const rawEventId = String(formData.get("event_id") || "");
  const eventId = rawEventId && rawEventId !== "none" ? rawEventId : null;

  if (!recipientId) return { error: "Choose a member." };
  if (!Number.isInteger(points) || points === 0 || points < -100 || points > 100) {
    return { error: "Points must be a whole number between -100 and 100 (not 0)." };
  }
  if (!reason) return { error: "Add a reason so everyone knows what the points are for." };

  const recipient = await requireRecipient(supabase, recipientId);
  if (!recipient) return { error: "Points can only be given to Core or Working Committee members." };

  const { data, error } = await supabase
    .from("point_awards")
    .insert({ recipient_id: recipientId, awarded_by: userId, event_id: eventId, points, reason })
    .select("id")
    .single();
  if (error) return { error: error.message };

  const verb = points > 0 ? `gave you ${points} point${points === 1 ? "" : "s"}` : `deducted ${Math.abs(points)} point${points === -1 ? "" : "s"}`;
  await supabase.from("notifications").insert({
    recipient_id: recipientId,
    title: points > 0 ? `You earned ${points} point${points === 1 ? "" : "s"}` : "Points deducted",
    message: `${myName} ${verb}: ${reason}`,
    type: "info",
    link: "/my-recognition",
  });

  await logActivity({
    action: points > 0 ? `gave ${points} points to ${recipient.full_name}` : `deducted ${Math.abs(points)} points from ${recipient.full_name}`,
    entityType: "points",
    entityId: data.id,
    details: { reason },
  });

  revalidateRecognition();
  return { success: true };
}

export async function awardBadge(formData: FormData) {
  const ctx = await requireAwarder();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase, userId, myName } = ctx;

  const recipientId = String(formData.get("recipient_id") || "");
  const eventId = String(formData.get("event_id") || "");
  const choice = String(formData.get("badge") || "");
  const customName = String(formData.get("custom_badge") || "").trim().replace(/\s+/g, " ");
  const note = String(formData.get("note") || "").trim() || null;

  if (!recipientId) return { error: "Choose a member." };
  if (!eventId) return { error: "Choose the event this badge is for." };

  let badge = choice;
  if (choice === "other") {
    if (customName.length < 2) return { error: "Write a name for the badge." };
    if (customName.length > CUSTOM_BADGE_MAX) return { error: `Keep the badge name under ${CUSTOM_BADGE_MAX} characters.` };
    badge = customBadgeKey(customName);
  } else if (!BADGES.some((b) => b.key === choice)) {
    return { error: "Choose a badge." };
  }

  const recipient = await requireRecipient(supabase, recipientId);
  if (!recipient) return { error: "Badges can only be given to Core or Working Committee members." };

  const { data: event } = await supabase.from("events").select("title").eq("id", eventId).single();
  if (!event) return { error: "That event no longer exists." };

  const { data, error } = await supabase
    .from("badge_awards")
    .insert({ recipient_id: recipientId, awarded_by: userId, event_id: eventId, badge, note })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { error: `${recipient.full_name} already has this badge for this event.` };
    return { error: error.message };
  }

  const label = getBadge(badge).label;
  await supabase.from("notifications").insert({
    recipient_id: recipientId,
    title: `You earned the ${label} badge`,
    message: `${myName} awarded you "${label}" for ${event.title}.${note ? ` ${note}` : ""}`,
    type: "info",
    link: "/my-recognition",
  });

  await logActivity({
    action: `awarded the ${label} badge to ${recipient.full_name}`,
    entityType: "badge",
    entityId: data.id,
    details: { event: event.title },
  });

  revalidateRecognition();
  return { success: true };
}

export async function removePointAward(id: string) {
  const ctx = await requireAwarder();
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await ctx.supabase.from("point_awards").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity({ action: "removed a points award", entityType: "points", entityId: id });
  revalidateRecognition();
  return { success: true };
}

export async function removeBadgeAward(id: string) {
  const ctx = await requireAwarder();
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await ctx.supabase.from("badge_awards").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity({ action: "removed a badge", entityType: "badge", entityId: id });
  revalidateRecognition();
  return { success: true };
}
