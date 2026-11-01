"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/actions/activity";
import { getSessionProfile } from "@/lib/auth";

export interface PollOption {
  id: string;
  label: string;
  votes: number | null;
}

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  closes_at: string | null;
  is_open: boolean;
  created_at: string;
  creator_name: string | null;
  options: PollOption[];
  my_option_id: string | null;
  results_visible: boolean;
  total_votes: number;
}

async function canManage() {
  const me = await getSessionProfile();
  return { me, allowed: Boolean((me as { can_manage_voting?: boolean } | null)?.can_manage_voting) };
}

export async function getVotingAccess() {
  return (await canManage()).allowed;
}

export async function getPolls(): Promise<{ polls: Poll[]; ready: boolean }> {
  const { me } = await canManage();
  if (!me) return { polls: [], ready: true };
  const supabase = await createClient();

  const { data: polls, error } = await supabase
    .from("polls")
    .select("id, title, description, closes_at, is_closed, created_at, creator:profiles!polls_created_by_fkey(full_name), options:poll_options(id, label, position)")
    .order("created_at", { ascending: false });
  if (error) return { polls: [], ready: false };

  const { data: myVotes } = await supabase.from("poll_votes").select("poll_id, option_id").eq("voter_id", me.id);
  const mine = new Map((myVotes ?? []).map((v) => [v.poll_id, v.option_id]));

  const results = await Promise.all(
    (polls ?? []).map((p) => supabase.rpc("poll_results", { target_poll: p.id }))
  );

  const now = Date.now();
  const list: Poll[] = (polls ?? []).map((p, i) => {
    const counts = new Map(((results[i].data ?? []) as { option_id: string; votes: number }[]).map((r) => [r.option_id, Number(r.votes)]));
    const visible = counts.size > 0;
    const options = ((p.options ?? []) as { id: string; label: string; position: number }[])
      .sort((a, b) => a.position - b.position)
      .map((o) => ({ id: o.id, label: o.label, votes: visible ? (counts.get(o.id) ?? 0) : null }));
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      closes_at: p.closes_at,
      is_open: !p.is_closed && (!p.closes_at || new Date(p.closes_at).getTime() > now),
      created_at: p.created_at,
      creator_name: (p.creator as unknown as { full_name: string } | null)?.full_name ?? null,
      options,
      my_option_id: mine.get(p.id) ?? null,
      results_visible: visible,
      total_votes: visible ? options.reduce((sum, o) => sum + (o.votes ?? 0), 0) : 0,
    };
  });

  list.sort((a, b) => Number(b.is_open) - Number(a.is_open) || b.created_at.localeCompare(a.created_at));
  return { polls: list, ready: true };
}

export async function createPoll(formData: FormData) {
  const { me, allowed } = await canManage();
  if (!me || !allowed) return { error: "Only the voting manager can create polls." };

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const closesRaw = String(formData.get("closes_at") || "").trim();
  const options = formData
    .getAll("option")
    .map((o) => String(o).trim())
    .filter(Boolean);

  if (title.length < 3) return { error: "Give the poll a question or title." };
  if (options.length < 2) return { error: "Add at least two choices." };
  if (options.length > 10) return { error: "A poll can have at most 10 choices." };
  if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) return { error: "Each choice must be different." };

  let closesAt: string | null = null;
  if (closesRaw) {
    // datetime-local values are in the voter's local time; treat them as India time.
    const d = new Date(`${closesRaw}:00+05:30`);
    if (Number.isNaN(d.getTime())) return { error: "That closing time isn't valid." };
    if (d.getTime() <= Date.now()) return { error: "The closing time must be in the future." };
    closesAt = d.toISOString();
  }

  const supabase = await createClient();
  const { data: poll, error } = await supabase
    .from("polls")
    .insert({ title, description, closes_at: closesAt, created_by: me.id })
    .select("id")
    .single();
  if (error) return { error: error.message };

  const { error: optError } = await supabase
    .from("poll_options")
    .insert(options.map((label, position) => ({ poll_id: poll.id, label, position })));
  if (optError) {
    await supabase.from("polls").delete().eq("id", poll.id);
    return { error: optError.message };
  }

  const { data: members } = await supabase.from("profiles").select("id").eq("is_active", true).neq("id", me.id);
  if (members && members.length > 0) {
    await supabase.from("notifications").insert(
      members.map((m) => ({
        recipient_id: m.id,
        title: "New poll: cast your vote",
        message: `${me.full_name} opened a poll: ${title}`,
        type: "info" as const,
        link: "/voting",
      }))
    );
  }

  await logActivity({ action: `created a poll: ${title}`, entityType: "poll", entityId: poll.id, actorId: me.id });
  revalidatePath("/voting");
  return { success: true };
}

export async function castVote(pollId: string, optionId: string) {
  const me = await getSessionProfile();
  if (!me) return { error: "You must be signed in." };
  if (!optionId) return { error: "Choose an option first." };
  const supabase = await createClient();
  const { error } = await supabase.from("poll_votes").insert({ poll_id: pollId, option_id: optionId, voter_id: me.id });
  if (error) {
    if (error.code === "23505") return { error: "You've already voted in this poll." };
    return { error: "This poll is closed or the choice is no longer available." };
  }
  revalidatePath("/voting");
  return { success: true };
}

export async function closePoll(pollId: string) {
  const { me, allowed } = await canManage();
  if (!me || !allowed) return { error: "Only the voting manager can close polls." };
  const supabase = await createClient();
  const { error } = await supabase.from("polls").update({ is_closed: true }).eq("id", pollId);
  if (error) return { error: error.message };
  await logActivity({ action: "closed a poll", entityType: "poll", entityId: pollId, actorId: me.id });
  revalidatePath("/voting");
  return { success: true };
}

export async function deletePoll(pollId: string) {
  const { me, allowed } = await canManage();
  if (!me || !allowed) return { error: "Only the voting manager can delete polls." };
  const supabase = await createClient();
  const { error } = await supabase.from("polls").delete().eq("id", pollId);
  if (error) return { error: error.message };
  await logActivity({ action: "deleted a poll", entityType: "poll", entityId: pollId, actorId: me.id });
  revalidatePath("/voting");
  return { success: true };
}
