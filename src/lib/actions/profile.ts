"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/auth";
import { logActivity } from "@/lib/actions/activity";

const PHOTO_BUCKET = "avatars";
const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png" };
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

function optional(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  return value || null;
}

// Members edit their own details. Role, committee and account status are protected in the
// database, so only these fields can change here.
export async function updateMyProfile(formData: FormData) {
  const me = await getSessionProfile();
  if (!me) return { error: "You must be signed in." };

  const fullName = String(formData.get("full_name") || "").trim().replace(/\s+/g, " ");
  const phone = optional(formData, "phone");
  const rollNumber = optional(formData, "roll_number");
  const ieeeNo = optional(formData, "ieee_membership_no");
  const bio = optional(formData, "bio");

  if (fullName.length < 2) return { error: "Enter your full name." };
  if (fullName.length > 80) return { error: "Keep your name under 80 characters." };
  // Only check fields that changed, so an old odd value never blocks other edits.
  if (phone && phone !== me.phone && !/^[+\d][\d\s()-]{6,19}$/.test(phone))
    return { error: "Enter a valid phone number, for example +91 98765 43210." };
  if (rollNumber && rollNumber.length > 30) return { error: "Keep the roll number under 30 characters." };
  if (ieeeNo && ieeeNo !== me.ieee_membership_no && !/^\d{6,12}$/.test(ieeeNo))
    return { error: "An IEEE membership number is 6 to 12 digits." };
  if (bio && bio.length > 300) return { error: "Keep the about-me note under 300 characters." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      roll_number: rollNumber,
      ieee_membership_no: ieeeNo,
      bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", me.id);
  if (error) {
    if (error.code === "23505") return { error: "That IEEE membership number is already used by another account." };
    return { error: error.message };
  }

  await logActivity({ action: "updated their profile", entityType: "profile", entityId: me.id, actorId: me.id });
  revalidatePath("/", "layout");
  return { success: true };
}

// Removes every photo in the member's folder except the one to keep.
async function clearOldPhotos(memberId: string, keepPath?: string) {
  const admin = createAdminClient();
  const { data } = await admin.storage.from(PHOTO_BUCKET).list(memberId);
  const stale = (data ?? []).map((f) => `${memberId}/${f.name}`).filter((p) => p !== keepPath);
  if (stale.length) await admin.storage.from(PHOTO_BUCKET).remove(stale);
}

// The photo arrives already cropped to a small square in the browser. The server checks it
// and stores it in the member's own folder; the path is never taken from the request.
export async function uploadMyPhoto(formData: FormData) {
  const me = await getSessionProfile();
  if (!me) return { error: "You must be signed in." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo first." };
  const ext = PHOTO_TYPES[file.type];
  if (!ext) return { error: "Use a JPG or PNG photo." };
  if (file.size > MAX_PHOTO_BYTES) return { error: "That photo is too large. Use one under 2 MB." };

  const admin = createAdminClient();
  const path = `${me.id}/${randomUUID()}.${ext}`;
  const upload = () => admin.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type, upsert: false });

  let { error: uploadError } = await upload();
  if (uploadError && /bucket not found/i.test(uploadError.message)) {
    // First photo ever: create the public photo bucket, then try again.
    await admin.storage.createBucket(PHOTO_BUCKET, { public: true });
    ({ error: uploadError } = await upload());
  }
  if (uploadError) {
    console.error("Photo upload failed:", uploadError.message);
    return { error: "The photo couldn't be uploaded. Please try again." };
  }

  const publicUrl = admin.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", me.id);
  if (error) {
    await admin.storage.from(PHOTO_BUCKET).remove([path]);
    return { error: error.message };
  }

  await clearOldPhotos(me.id, path);
  revalidatePath("/", "layout");
  return { success: true, url: publicUrl };
}

export async function removeMyPhoto() {
  const me = await getSessionProfile();
  if (!me) return { error: "You must be signed in." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", me.id);
  if (error) return { error: error.message };
  await clearOldPhotos(me.id);
  revalidatePath("/", "layout");
  return { success: true };
}
