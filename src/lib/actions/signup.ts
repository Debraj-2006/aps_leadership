"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { SIGNUP_ROLES, ROLE_LABELS, POSITION_REQUIRED_ROLES, NON_SIGNUP_POSITIONS } from "@/lib/roles";
import type { UserRole } from "@/lib/types";
import { createHash, timingSafeEqual } from "crypto";
import { REQUIRE_APPROVAL } from "@/lib/config";

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

// Position titles a new Executive or Core member can choose, from the designations table.
export async function getSignupPositions(): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("designations").select("title").order("rank");
  return (data ?? []).map((d) => d.title as string).filter((t) => !NON_SIGNUP_POSITIONS.includes(t));
}

export async function registerAction(formData: FormData): Promise<{ error?: string; success?: boolean; requiresApproval?: boolean }> {
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const membershipNo = String(formData.get("ieee_membership_no") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");
  const role = String(formData.get("role") || "") as UserRole;

  if (!fullName || !email || !membershipNo || !password) {
    return { error: "Please fill in all required fields." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }
  if (!SIGNUP_ROLES.includes(role)) {
    return { error: "Please select your committee tier." };
  }
  if (role === "executive") {
    const expectedKey = process.env.EXECUTIVE_SIGNUP_KEY;
    const providedKey = String(formData.get("executive_key") || "").trim();
    if (!expectedKey) {
      return { error: "Executive registration is currently disabled. Please contact an administrator." };
    }
    if (!providedKey || !safeEqual(providedKey, expectedKey)) {
      return { error: "Invalid executive access key." };
    }
  }

  const admin = createAdminClient();

  let position: string | null = null;
  if (POSITION_REQUIRED_ROLES.includes(role)) {
    position = String(formData.get("position") || "").trim();
    if (!position) {
      return { error: "Please select your committee position." };
    }
    const positions = await getSignupPositions();
    if (!positions.includes(position)) {
      return { error: "Please select a valid committee position." };
    }
  }

  const { data: existingMembership } = await admin
    .from("profiles")
    .select("id")
    .eq("ieee_membership_no", membershipNo)
    .maybeSingle();
  if (existingMembership) {
    return { error: "An account with this IEEE membership number already exists." };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    const message = createError?.message ?? "";
    return {
      error: message.toLowerCase().includes("already")
        ? "An account with this email already exists."
        : message || "Could not create your account. Please try again.",
    };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      role,
      position,
      ieee_membership_no: membershipNo,
      is_active: !REQUIRE_APPROVAL,
    })
    .eq("id", created.user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  const { data: admins } = await admin
    .from("profiles")
    .select("id")
    .in("role", ["super_admin", "faculty_advisor", "executive"]);

  if (admins && admins.length > 0) {
    await admin.from("notifications").insert(
      admins.map((a) => ({
        recipient_id: a.id,
        title: REQUIRE_APPROVAL ? "New membership request" : "New member joined",
        message: REQUIRE_APPROVAL
          ? `${fullName} has requested ${ROLE_LABELS[role]} access and is awaiting approval.`
          : `${fullName} has joined with ${ROLE_LABELS[role]} access${position ? ` as ${position}` : ""}.`,
        type: "approval" as const,
        link: "/admin/users",
      }))
    );
  }

  return { success: true, requiresApproval: REQUIRE_APPROVAL };
}
