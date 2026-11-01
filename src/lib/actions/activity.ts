"use server";

import { createClient } from "@/lib/supabase/server";

export async function logActivity(params: {
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;

  await supabase.from("activity_logs").insert({
    actor_id: authData.user.id,
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
