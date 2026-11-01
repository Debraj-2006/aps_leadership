"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/actions/activity";
import { canApprovePendingUsers, canManageUsers } from "@/lib/roles";
import type { UserRole } from "@/lib/types";

async function requireRole(check: (role: UserRole) => boolean) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).single();
  return !!profile && check(profile.role as UserRole);
}

const DEFAULT_PASSWORD = "IEEEAPS@2025";

export async function getAllProfiles() {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("full_name");
  return data ?? [];
}

export async function createUser(formData: FormData) {
  if (!(await requireRole(canManageUsers))) return { error: "Not authorized to create accounts." };

  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "working") as UserRole;
  const ieeeMembershipNo = String(formData.get("ieee_membership_no") || "") || null;
  const rollNumber = String(formData.get("roll_number") || "") || null;
  const phone = String(formData.get("phone") || "") || null;

  if (!fullName || !email) return { error: "Name and email are required." };

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    return { error: createError?.message || "Could not create account." };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ full_name: fullName, role, ieee_membership_no: ieeeMembershipNo, roll_number: rollNumber, phone })
    .eq("id", created.user.id);

  if (profileError) return { error: profileError.message };

  await logActivity({ action: "created a user account", entityType: "profile", entityId: created.user.id });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function setUserRole(profileId: string, role: UserRole) {
  if (!(await requireRole(canManageUsers))) return { error: "Not authorized to change roles." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", profileId);
  if (error) return { error: error.message };

  await logActivity({ action: `changed role to ${role}`, entityType: "profile", entityId: profileId });

  revalidatePath("/admin/users");
  revalidatePath("/leadership");
  return { success: true };
}

export async function setUserActive(profileId: string, isActive: boolean) {
  if (!(await requireRole(canApprovePendingUsers))) return { error: "Not authorized to change account status." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", profileId);
  if (error) return { error: error.message };

  if (isActive) {
    await supabase.from("notifications").insert({
      recipient_id: profileId,
      title: "Your account is approved",
      message: "Welcome to the chapter hub. You now have access to your committee's pages.",
      type: "approval",
    });
  }

  await logActivity({
    action: isActive ? "approved a user" : "deactivated a user",
    entityType: "profile",
    entityId: profileId,
  });

  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getPendingApprovalCount() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_active", false);
  return count ?? 0;
}
