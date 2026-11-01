"use server";

import { createClient } from "@/lib/supabase/server";

export async function getArchiveTenure(tenureId: string) {
  const supabase = await createClient();

  const [{ data: tenure }, { data: members }, { data: events }, { data: documents }] = await Promise.all([
    supabase.from("tenures").select("*").eq("id", tenureId).single(),
    supabase
      .from("committee_members")
      .select("*, profile:profiles(full_name, email), designation:designations(title, rank)")
      .eq("tenure_id", tenureId)
      .order("rank", { foreignTable: "designations", ascending: true }),
    supabase.from("events").select("*").eq("tenure_id", tenureId).order("event_date", { ascending: false }),
    supabase.from("documents").select("*").eq("tenure_id", tenureId).order("created_at", { ascending: false }),
  ]);

  return { tenure, members: members ?? [], events: events ?? [], documents: documents ?? [] };
}
