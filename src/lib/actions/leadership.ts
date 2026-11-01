"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/actions/activity";
import { canManageLeadership } from "@/lib/roles";
import type { UserRole } from "@/lib/types";

const DEFAULT_PASSWORD = "IEEEAPS@2025";

async function requireLeadershipAccess() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).single();
  return !!profile && canManageLeadership(profile.role as UserRole);
}

export async function getDesignations() {
  const supabase = await createClient();
  const { data } = await supabase.from("designations").select("*").order("rank");
  return data ?? [];
}

export async function getProfilesForSelect() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .order("full_name");
  return data ?? [];
}

export async function getCommitteeMembers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("committee_members")
    .select("*, profile:profiles(*), designation:designations(*)")
    .order("rank", { foreignTable: "designations", ascending: true });
  return data ?? [];
}

export async function createDesignation(title: string, rank: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("designations").insert({ title, rank });
  if (error) return { error: error.message };
  revalidatePath("/leadership");
  return { success: true };
}

export async function addCommitteeMember(formData: FormData) {
  if (!(await requireLeadershipAccess())) return { error: "Not authorized to manage leadership." };

  const mode = String(formData.get("mode"));
  const designationId = String(formData.get("designation_id"));
  const customTitle = String(formData.get("custom_title") || "") || null;
  const isOutgoing = formData.get("is_outgoing") === "on";

  const supabase = await createClient();
  let profileId = String(formData.get("profile_id") || "");

  if (mode === "new") {
    const fullName = String(formData.get("full_name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const role = String(formData.get("role") || "working") as UserRole;
    const ieeeMembershipNo = String(formData.get("ieee_membership_no") || "") || null;
    const rollNumber = String(formData.get("roll_number") || "") || null;
    const phone = String(formData.get("phone") || "") || null;

    if (!fullName || !email) return { error: "Name and email are required for a new person." };

    const admin = createAdminClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError || !created.user) {
      return { error: createError?.message || "Could not create account for this person." };
    }

    profileId = created.user.id;

    const { error: profileError } = await admin
      .from("profiles")
      .update({ full_name: fullName, role, ieee_membership_no: ieeeMembershipNo, roll_number: rollNumber, phone })
      .eq("id", profileId);

    if (profileError) return { error: profileError.message };
  }

  if (!profileId || !designationId) {
    return { error: "Please complete all required fields." };
  }

  const { error } = await supabase.from("committee_members").insert({
    profile_id: profileId,
    designation_id: designationId,
    custom_title: customTitle,
    is_outgoing: isOutgoing,
  });

  if (error) return { error: error.message };

  await logActivity({
    action: "added a committee member",
    entityType: "committee_member",
    entityId: profileId,
  });

  revalidatePath("/leadership");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateCommitteeMember(id: string, formData: FormData) {
  const supabase = await createClient();
  const designationId = String(formData.get("designation_id"));
  const customTitle = String(formData.get("custom_title") || "") || null;
  const isOutgoing = formData.get("is_outgoing") === "on";
  const leftAt = String(formData.get("left_at") || "") || null;

  const { error } = await supabase
    .from("committee_members")
    .update({
      designation_id: designationId,
      custom_title: customTitle,
      is_outgoing: isOutgoing,
      left_at: leftAt,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await logActivity({ action: "updated a committee member", entityType: "committee_member", entityId: id });

  revalidatePath("/leadership");
  return { success: true };
}

export async function removeCommitteeMember(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("committee_members").delete().eq("id", id);
  if (error) return { error: error.message };

  await logActivity({ action: "removed a committee member", entityType: "committee_member", entityId: id });

  revalidatePath("/leadership");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProfileRole(profileId: string, role: UserRole) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", profileId);
  if (error) return { error: error.message };
  revalidatePath("/leadership");
  revalidatePath("/admin/users");
  return { success: true };
}
