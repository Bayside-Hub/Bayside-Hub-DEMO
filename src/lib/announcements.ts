import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { announcements as seedAnnouncements, type Announcement } from "./data";
import type { AnnouncementVersionRow } from "./supabase/types";

export const getAnnouncements = cache(async (limit = 100): Promise<Announcement[]> => {
  if (!isSupabaseConfigured()) return seedAnnouncements;

  const supabase = await createServerClient();
  const { data: rows, error } = await supabase
    .from("announcements")
    .select("id, title, tag, body, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return seedAnnouncements.slice(0, limit);

  const db: Announcement[] = (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    tag: row.tag,
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(row.created_at)),
    excerpt: row.body,
  }));

  return db.slice(0, limit);
});

export const getArchivedAnnouncements = cache(async (limit = 100, from?: string, to?: string): Promise<Announcement[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerClient();
  let query = supabase
    .from("announcements")
    .select("id, title, tag, body, created_at, effective_date")
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false })
    .limit(limit);
  if (from) query = query.gte("effective_date", from);
  if (to) query = query.lte("effective_date", to);
  const { data: rows, error } = await query;
  if (error) return [];
  return (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    tag: row.tag,
    date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(row.effective_date ?? row.created_at)),
    excerpt: row.body,
  }));
});

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerClient();
    const { data: row } = await supabase
      .from("announcements")
      .select("id, title, tag, body, created_at")
      .eq("id", id)
      .or("published.eq.true,archived_at.not.is.null")
      .maybeSingle();
    if (row) {
      return {
        id: row.id,
        title: row.title,
        tag: row.tag,
        date: new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(new Date(row.created_at)),
        excerpt: row.body,
      };
    }
    return null;
  }
  return seedAnnouncements.find((a) => a.id === id) ?? null;
}

export async function getAnnouncementVersions(id: string): Promise<AnnouncementVersionRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("announcement_versions")
    .select("*")
    .eq("announcement_id", id)
    .order("version_number", { ascending: false });
  return error ? [] : data ?? [];
}
