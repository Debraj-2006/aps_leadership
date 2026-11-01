"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/actions/activity";
import { isAdminRole } from "@/lib/roles";
import { getSessionProfile } from "@/lib/auth";
import type { HandoverStatus, TaskPriority, TaskStatus, UserRole } from "@/lib/types";

export async function getHandoverRecords() {
  const profile = await getSessionProfile();
  if (!profile) return [];
  const supabase = await createClient();
  const authData = { user: { id: profile.id } };

  let query = supabase
    .from("handover_records")
    .select(
      "*, outgoing_profile:profiles!handover_records_outgoing_profile_id_fkey(full_name), incoming_profile:profiles!handover_records_incoming_profile_id_fkey(full_name), designation:designations(title), tasks:handover_tasks(*)"
    )
    .order("created_at", { ascending: false });

  if (profile && !isAdminRole(profile.role as UserRole)) {
    query = query.or(`outgoing_profile_id.eq.${authData.user.id},incoming_profile_id.eq.${authData.user.id}`);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getHandoverRecord(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("handover_records")
    .select(
      "*, outgoing_profile:profiles!handover_records_outgoing_profile_id_fkey(full_name, email), incoming_profile:profiles!handover_records_incoming_profile_id_fkey(full_name, email), designation:designations(title), tasks:handover_tasks(*), handover_documents(document:documents(id, title, file_path, category))"
    )
    .eq("id", id)
    .single();
  return data;
}

export async function createHandoverRecord(formData: FormData) {
  const supabase = await createClient();

  const designationId = String(formData.get("designation_id") || "") || null;
  const outgoingProfileId = String(formData.get("outgoing_profile_id") || "") || null;
  const incomingProfileId = String(formData.get("incoming_profile_id") || "") || null;
  const notes = String(formData.get("notes") || "") || null;

  const { data, error } = await supabase
    .from("handover_records")
    .insert({
      designation_id: designationId,
      outgoing_profile_id: outgoingProfileId,
      incoming_profile_id: incomingProfileId,
      notes,
      status: "pending",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (incomingProfileId) {
    await supabase.from("notifications").insert({
      recipient_id: incomingProfileId,
      title: "New handover assigned to you",
      message: "A handover record has been created for your incoming designation.",
      type: "handover",
      link: `/handover/${data.id}`,
    });
  }

  await logActivity({ action: "created a handover record", entityType: "handover_record", entityId: data.id });

  revalidatePath("/handover");
  revalidatePath("/dashboard");
  return { success: true, id: data.id };
}

export async function updateHandoverStatus(id: string, status: HandoverStatus) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "approved") {
    update.approved_by = authData.user?.id;
    update.approved_at = new Date().toISOString();
  }

  const { error } = await supabase.from("handover_records").update(update).eq("id", id);
  if (error) return { error: error.message };

  await logActivity({ action: `marked handover as ${status}`, entityType: "handover_record", entityId: id });

  revalidatePath(`/handover/${id}`);
  revalidatePath("/handover");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addHandoverTask(handoverRecordId: string, formData: FormData) {
  const supabase = await createClient();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "") || null;
  const dueDate = String(formData.get("due_date") || "") || null;
  const priority = String(formData.get("priority") || "medium") as TaskPriority;

  if (!title) return { error: "Task title is required." };

  const { error } = await supabase.from("handover_tasks").insert({
    handover_record_id: handoverRecordId,
    title,
    description,
    due_date: dueDate,
    priority,
  });

  if (error) return { error: error.message };

  await supabase
    .from("handover_records")
    .update({ status: "in_progress" })
    .eq("id", handoverRecordId)
    .eq("status", "pending");

  revalidatePath(`/handover/${handoverRecordId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleHandoverTask(id: string, handoverRecordId: string, status: TaskStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("handover_tasks").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/handover/${handoverRecordId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteHandoverTask(id: string, handoverRecordId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("handover_tasks").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/handover/${handoverRecordId}`);
  return { success: true };
}

export async function linkHandoverDocument(handoverRecordId: string, documentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("handover_documents")
    .insert({ handover_record_id: handoverRecordId, document_id: documentId });
  if (error) return { error: error.message };

  revalidatePath(`/handover/${handoverRecordId}`);
  return { success: true };
}

export async function unlinkHandoverDocument(id: string, handoverRecordId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("handover_documents").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/handover/${handoverRecordId}`);
  return { success: true };
}
