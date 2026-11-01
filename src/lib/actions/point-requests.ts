"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/actions/activity";
import { getSessionProfile } from "@/lib/auth";
import { ADMIN_ROLES, canAwardRecognition, peerPointRecipientRoles, ROLE_LABELS } from "@/lib/roles";
import type { UserRole } from "@/lib/types";

export type PointRequestStatus = "pending" | "approved" | "declined";

export interface PointRequestRow {
  id: string;
  requested_by: string | null;
  recipient_id: string;
  points: number;
  reason: string;
  status: PointRequestStatus;
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  requester: { full_name: string; role: UserRole } | null;
  recipient: { full_name: string; role: UserRole } | null;
  reviewer: { full_name: string } | null;
  event: { title: string } | null;
}

const SELECT =
  "id, requested_by, recipient_id, points, reason, status, review_note, created_at, reviewed_at, requester:profiles!point_requests_requested_by_fkey(full_name, role), recipient:profiles!point_requests_recipient_id_fkey(full_name, role), reviewer:profiles!point_requests_reviewed_by_fkey(full_name), event:events(title)";

function revalidateRequests() {
  revalidatePath("/recognition");
  revalidatePath("/my-recognition");
  revalidatePath("/dashboard");
}

export async function getPointRequestOptions() {
  const me = await getSessionProfile();
  const roles = me ? peerPointRecipientRoles(me.role) : [];
  if (!me || roles.length === 0) return { me: null, members: [], events: [] };
  const supabase = await createClient();
  const [{ data: members }, { data: events }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("role", roles)
      .eq("is_active", true)
      .neq("id", me.id)
      .order("full_name"),
    supabase.from("events").select("id, title, event_date").order("event_date", { ascending: false }),
  ]);
  return {
    me: { id: me.id, full_name: me.full_name, email: me.email, role: me.role },
    members: (members ?? []) as { id: string; full_name: string; email: string; role: UserRole }[],
    events: (events ?? []) as { id: string; title: string; event_date: string }[],
  };
}

export async function getMyPointRequests(limit = 20): Promise<PointRequestRow[]> {
  const me = await getSessionProfile();
  if (!me) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("point_requests")
    .select(SELECT)
    .eq("requested_by", me.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as PointRequestRow[];
}

export async function getPendingPointRequests(): Promise<PointRequestRow[]> {
  const me = await getSessionProfile();
  if (!me || !canAwardRecognition(me.role)) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("point_requests")
    .select(SELECT)
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as PointRequestRow[];
}

export async function getPendingPointRequestCount() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("point_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}

export async function createPointRequest(formData: FormData) {
  const me = await getSessionProfile();
  if (!me) return { error: "You must be signed in." };
  const allowed = peerPointRecipientRoles(me.role);
  if (allowed.length === 0) return { error: "Only Core and Working Committee members can request points." };

  const recipientId = String(formData.get("recipient_id") || "");
  const points = Number(formData.get("points"));
  const reason = String(formData.get("reason") || "").trim();
  const rawEvent = String(formData.get("event_id") || "");
  const eventId = rawEvent && rawEvent !== "none" ? rawEvent : null;

  if (!recipientId) return { error: "Choose who the points are for." };
  if (!Number.isInteger(points) || points < 1 || points > 100) return { error: "Points must be a whole number from 1 to 100." };
  if (!reason) return { error: "Add a reason so the Executive knows what the points are for." };

  const supabase = await createClient();
  const { data: recipient } = await supabase.from("profiles").select("id, full_name, role").eq("id", recipientId).single();
  const forSelf = recipient?.id === me.id;
  if (!recipient || (!forSelf && !allowed.includes(recipient.role as UserRole))) {
    return {
      error:
        me.role === "working"
          ? "Working Committee members can request points for themselves, Core Committee members or Executives."
          : "Core Committee members can request points for themselves, Working Committee members or Executives.",
    };
  }
  const forWhom = forSelf ? "themselves" : recipient.full_name;

  const { data, error } = await supabase
    .from("point_requests")
    .insert({ requested_by: me.id, recipient_id: recipientId, points, reason, event_id: eventId })
    .select("id")
    .single();
  if (error) return { error: error.message };

  const { data: reviewers } = await supabase.from("profiles").select("id").in("role", ADMIN_ROLES).eq("is_active", true);
  if (reviewers && reviewers.length > 0) {
    await supabase.from("notifications").insert(
      reviewers.map((r) => ({
        recipient_id: r.id,
        title: "Point request to review",
        message: `${me.full_name} (${ROLE_LABELS[me.role]}) requested ${points} points for ${forWhom}: ${reason}`,
        type: "approval" as const,
        link: "/recognition",
      }))
    );
  }

  await logActivity({
    action: `requested ${points} points for ${forWhom}`,
    entityType: "point_request",
    entityId: data.id,
    actorId: me.id,
    details: { reason },
  });

  revalidateRequests();
  return { success: true };
}

export async function withdrawPointRequest(id: string) {
  const me = await getSessionProfile();
  if (!me) return { error: "You must be signed in." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("point_requests")
    .delete()
    .eq("id", id)
    .eq("requested_by", me.id)
    .eq("status", "pending")
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Only pending requests can be withdrawn." };
  revalidateRequests();
  return { success: true };
}

export async function reviewPointRequest(id: string, approve: boolean, note?: string) {
  const me = await getSessionProfile();
  if (!me || !canAwardRecognition(me.role)) return { error: "Only Executive Committee members can review point requests." };
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("point_requests")
    .select(
      "id, points, reason, requested_by, recipient_id, recipient:profiles!point_requests_recipient_id_fkey(full_name, role)"
    )
    .eq("id", id)
    .single();
  if (!request) return { error: "This request no longer exists." };

  const { error } = await supabase.rpc("review_point_request", { request_id: id, approve, note: note ?? null });
  if (error) return { error: error.message };

  const recipientRow = request.recipient as unknown as { full_name: string; role: UserRole } | null;
  const recipientName = recipientRow?.full_name ?? "the member";
  const selfRequest = request.requested_by === request.recipient_id;
  const notes = [];
  if (request.requested_by && !(approve && selfRequest)) {
    notes.push({
      recipient_id: request.requested_by,
      title: approve ? "Your point request was approved" : "Your point request was declined",
      message: approve
        ? `${me.full_name} approved ${request.points} points for ${recipientName}.`
        : `${me.full_name} declined your request${selfRequest ? "" : ` for ${recipientName}`}.${note ? ` ${note}` : ""}`,
      type: "approval" as const,
      link: "/my-recognition",
    });
  }
  if (approve) {
    notes.push({
      recipient_id: request.recipient_id,
      title: `You earned ${request.points} point${request.points === 1 ? "" : "s"}`,
      message: selfRequest
        ? `${me.full_name} approved your request: ${request.reason}`
        : `${request.reason} (requested by a teammate, approved by ${me.full_name})`,
      type: "info" as const,
      link: "/my-recognition",
    });
  }
  if (notes.length) await supabase.from("notifications").insert(notes);

  await logActivity({
    action: `${approve ? "approved" : "declined"} a point request for ${recipientName}`,
    entityType: "point_request",
    entityId: id,
    actorId: me.id,
  });

  revalidateRequests();
  return { success: true };
}
