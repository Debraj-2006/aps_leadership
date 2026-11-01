import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Each of these hits Supabase over the network. cache() makes the layout, the page and
// every data helper rendered for the same request share one lookup instead of repeating it.
// getClaims() verifies the session JWT locally against the project's ES256 signing keys,
// so it doesn't wait on the Auth server the way getUser() does.
export const getAuthUser = cache(async (): Promise<{ id: string } | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  return id ? { id } : null;
});

export const getSessionProfile = cache(async (): Promise<Profile | null> => {
  const user = await getAuthUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (profile as Profile | null) ?? null;
});

export async function getCurrentProfile(): Promise<{ profile: Profile; userId: string }> {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  return { profile, userId: profile.id };
}
