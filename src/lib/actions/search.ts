"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";

export interface SearchHit {
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export interface SearchGroup {
  label: string;
  hits: SearchHit[];
}

const LIMIT = 5;

// Searches everything the member is allowed to see. Database rules still apply, and the
// Working Committee only gets the sections they can open.
export async function searchEverything(raw: string): Promise<SearchGroup[]> {
  const me = await getSessionProfile();
  // Commas, brackets and quotes would break the database filter syntax, so drop them.
  const query = raw.replace(/[,()"]/g, " ").trim().slice(0, 60);
  if (!me || query.length < 2) return [];
  const like = `%${query.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  const working = me.role === "working";
  const supabase = await createClient();

  const [events, documents, members, tasks, announcements] = await Promise.all([
    working
      ? Promise.resolve({ data: [] as { id: string; title: string; event_date: string; venue: string | null }[] })
      : supabase.from("events").select("id, title, event_date, venue").ilike("title", like).order("event_date", { ascending: false }).limit(LIMIT),
    working
      ? Promise.resolve({ data: [] as { id: string; title: string; category: string }[] })
      : supabase.from("documents").select("id, title, category").ilike("title", like).order("created_at", { ascending: false }).limit(LIMIT),
    supabase.from("profiles").select("id, full_name, position, role").eq("is_active", true).ilike("full_name", like).order("full_name").limit(LIMIT),
    supabase.from("member_tasks").select("id, title, status, due_date").ilike("title", like).order("created_at", { ascending: false }).limit(LIMIT),
    supabase.from("announcements").select("id, title, created_at").or(`title.ilike.${like},body.ilike.${like}`).order("created_at", { ascending: false }).limit(LIMIT),
  ]);

  const groups: SearchGroup[] = [
    {
      label: "Events",
      hits: (events.data ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: [new Date(e.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), e.venue].filter(Boolean).join(" · "),
        href: `/events/${e.id}`,
      })),
    },
    {
      label: "Documents",
      hits: (documents.data ?? []).map((d) => ({
        id: d.id,
        title: d.title,
        subtitle: d.category.replace(/_/g, " "),
        href: `/documents?search=${encodeURIComponent(d.title)}`,
      })),
    },
    {
      label: "Members",
      hits: (members.data ?? []).map((m) => ({
        id: m.id,
        title: m.full_name,
        subtitle: m.position ?? m.role.replace(/_/g, " "),
        href: "/members",
      })),
    },
    {
      label: "Tasks",
      hits: (tasks.data ?? []).map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: [t.status.replace(/_/g, " "), t.due_date ? `due ${new Date(t.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : null]
          .filter(Boolean)
          .join(" · "),
        href: "/tasks",
      })),
    },
    {
      label: "Announcements",
      hits: (announcements.data ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        href: "/announcements",
      })),
    },
  ];
  return groups.filter((g) => g.hits.length > 0);
}
