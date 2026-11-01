"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/actions/activity";
import type { DocumentCategory, DocumentVisibility } from "@/lib/types";

const BUCKET = "documents";

export async function getDocuments(filters: { search?: string; category?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("documents")
    .select("*, uploader:profiles(full_name)")
    .order("created_at", { ascending: false });

  if (filters.search) query = query.ilike("title", `%${filters.search}%`);
  if (filters.category && filters.category !== "all")
    query = query.eq("category", filters.category as DocumentCategory);

  const { data } = await query;
  return data ?? [];
}

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not authenticated." };

  const file = formData.get("file") as File | null;
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "other");
  const visibility = String(formData.get("visibility") || "all") as DocumentVisibility;
  const eventId = String(formData.get("event_id") || "") || null;

  if (!file || file.size === 0) return { error: "Please choose a file to upload." };
  if (!title) return { error: "Document title is required." };

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `general/${category}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
  });

  if (uploadError) return { error: uploadError.message };

  const { data, error } = await supabase
    .from("documents")
    .insert({
      title,
      category,
      visibility,
      event_id: eventId,
      file_path: path,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: authData.user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await logActivity({ action: "uploaded a document", entityType: "document", entityId: data.id, details: { title } });

  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteDocument(id: string, filePath: string) {
  const supabase = await createClient();
  await supabase.storage.from(BUCKET).remove([filePath]);
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return { error: error.message };

  await logActivity({ action: "deleted a document", entityType: "document", entityId: id });

  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getDocumentUrl(filePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, 60 * 10);
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}
