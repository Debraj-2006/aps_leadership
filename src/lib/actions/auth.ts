"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/actions/activity";
import { REQUIRE_APPROVAL } from "@/lib/config";

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const identifier = String(formData.get("identifier") || "").trim();
  const password = String(formData.get("password") || "");

  if (!identifier || !password) {
    return { error: "Email/membership number and password are required." };
  }

  let email = identifier;

  if (!identifier.includes("@")) {
    // Treat as an IEEE membership number — resolve it to the account's email.
    const admin = createAdminClient();
    const { data: match } = await admin
      .from("profiles")
      .select("email")
      .eq("ieee_membership_no", identifier)
      .maybeSingle();

    if (!match) {
      return { error: "No account found for that IEEE membership number." };
    }
    email = match.email;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Invalid credentials." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", data.user.id)
    .single();

  if (REQUIRE_APPROVAL && profile && !profile.is_active) {
    await supabase.auth.signOut();
    return {
      error: "Your account is pending approval from a Super Admin, Faculty Advisor, or Executive Committee member.",
    };
  }

  await logActivity({
    action: "logged in",
    entityType: "auth",
    entityId: data.user.id,
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    await logActivity({ action: "logged out", entityType: "auth", entityId: data.user.id });
  }
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
