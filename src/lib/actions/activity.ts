"use server";

import { createClient } from "@/lib/supabase/server";

export async function logActivity(params: {
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  actorId?: string;
}) {
  const supabase = await createClient();
  let actorId = params.actorId;
  if (!actorId) {
    const { data } = await supabase.auth.getClaims();
    actorId = data?.claims?.sub;
  }
  if (!actorId) return;

  await supabase.from("activity_logs").insert({
    actor_id: actorId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    details: params.details ?? null,
  });
}

export async function getRecentActivity(limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select("*, actor:profiles(full_name, avatar_url, role)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
