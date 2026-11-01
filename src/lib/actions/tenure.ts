"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/actions/activity";

export async function getTenuresWithCounts() {
  const supabase = await createClient();
  const { data: tenures } = await supabase
    .from("tenures")
    .select("*")
    .order("start_date", { ascending: false });

  if (!tenures) return [];

  const withCounts = await Promise.all(
    tenures.map(async (t) => {
      const [{ count: memberCount }, { count: eventCount }] = await Promise.all([
        supabase
          .from("committee_members")
          .select("*", { count: "exact", head: true })
          .eq("tenure_id", t.id),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("tenure_id", t.id),
      ]);
      return { ...t, memberCount: memberCount ?? 0, eventCount: eventCount ?? 0 };
    })
  );

  return withCounts;
}

export async function createTenure(formData: FormData) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  const academicYear = String(formData.get("academic_year") || "").trim();
  const startDate = String(formData.get("start_date") || "");
  const endDate = String(formData.get("end_date") || "");
  const status = String(formData.get("status") || "upcoming");
  const theme = String(formData.get("theme") || "") || null;
  const achievements = String(formData.get("achievements") || "") || null;

  if (!academicYear || !startDate || !endDate) {
    return { error: "Academic year, start date and end date are required." };
  }

  if (status === "active") {
    await supabase.from("tenures").update({ status: "completed" }).eq("status", "active");
  }

  const { data, error } = await supabase
    .from("tenures")
    .insert({
      academic_year: academicYear,
      start_date: startDate,
      end_date: endDate,
      status,
      theme,
      achievements,
      created_by: authData.user?.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await logActivity({ action: "created a tenure", entityType: "tenure", entityId: data.id });

  revalidatePath("/tenure");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTenure(id: string, formData: FormData) {
  const supabase = await createClient();

  const academicYear = String(formData.get("academic_year") || "").trim();
  const startDate = String(formData.get("start_date") || "");
  const endDate = String(formData.get("end_date") || "");
  const status = String(formData.get("status") || "upcoming");
  const theme = String(formData.get("theme") || "") || null;
  const achievements = String(formData.get("achievements") || "") || null;

  if (status === "active") {
    await supabase.from("tenures").update({ status: "completed" }).eq("status", "active").neq("id", id);
  }

  const { error } = await supabase
    .from("tenures")
    .update({
      academic_year: academicYear,
      start_date: startDate,
      end_date: endDate,
      status,
      theme,
      achievements,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await logActivity({ action: "updated a tenure", entityType: "tenure", entityId: id });

  revalidatePath("/tenure");
  revalidatePath("/dashboard");
  revalidatePath("/archive");
  return { success: true };
}

export async function deleteTenure(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tenures").delete().eq("id", id);
  if (error) return { error: error.message };

  await logActivity({ action: "deleted a tenure", entityType: "tenure", entityId: id });

  revalidatePath("/tenure");
  revalidatePath("/dashboard");
  return { success: true };
}
