import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { announcements as seedAnnouncements, type Announcement } from "./data";
import type { AnnouncementVersionRow } from "./supabase/types";

export const ANNOUNCEMENTS_PAGE_SIZE = 12;

function toAnnouncement(row: {
  id: string;
  title: string;
  tag: string;
  body: string;
  created_at: string;
  effective_date?: string | null;
  media_id?: string | null;
}, image?: { url: string; alt: string | null }): Announcement {
  const date = row.effective_date ?? row.created_at;
  return {
    id: row.id,
    title: row.title,
    tag: row.tag,
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date)),
    excerpt: row.body,
    imageUrl: image?.url,
    imageAlt: image?.alt ?? undefined,
  };
}

async function attachAnnouncementMedia(supabase: Awaited<ReturnType<typeof createServerClient>>, rows: Array<{ media_id?: string | null }>) {
  const ids = [...new Set(rows.map((row) => row.media_id).filter((id): id is string => Boolean(id)))];
  if (!ids.length) return new Map<string, { url: string; alt: string | null }>();
  const { data } = await supabase.from("club_media").select("id,storage_path,alt_text").in("id", ids);
  return new Map((data ?? []).map((item) => [item.id, { url: supabase.storage.from("club-media").getPublicUrl(item.storage_path).data.publicUrl, alt: item.alt_text }]));
}

export const getAnnouncements = cache(async (limit = 100): Promise<Announcement[]> => {
  if (!isSupabaseConfigured()) return seedAnnouncements.slice(0, limit);

  const supabase = await createServerClient();
  const { data: rows, error } = await supabase
    .from("announcements")
    .select("id, title, tag, body, created_at, media_id")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Unable to load announcements: ${error.message}`);
  const media = await attachAnnouncementMedia(supabase, rows ?? []);
  return (rows ?? []).map((row) => toAnnouncement(row, row.media_id ? media.get(row.media_id) : undefined)).slice(0, limit);
});

export const getAnnouncementTags = cache(async (): Promise<string[]> => {
  if (!isSupabaseConfigured()) return Array.from(new Set(seedAnnouncements.map((a) => a.tag)));
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("announcements").select("tag").eq("published", true);
  if (error) throw new Error(`Unable to load announcement filters: ${error.message}`);
  return Array.from(new Set((data ?? []).map((row) => row.tag))).sort();
});

export const getAnnouncementsPage = cache(async (
  page = 1,
  tag?: string,
  pageSize = ANNOUNCEMENTS_PAGE_SIZE,
): Promise<{ announcements: Announcement[]; page: number; pageCount: number }> => {
  const safePageSize = Math.max(1, Math.min(pageSize, 50));
  const safePage = Math.max(1, page);
  if (!isSupabaseConfigured()) {
    const filtered = tag ? seedAnnouncements.filter((item) => item.tag === tag) : seedAnnouncements;
    const pageCount = Math.max(1, Math.ceil(filtered.length / safePageSize));
    const start = (Math.min(safePage, pageCount) - 1) * safePageSize;
    return { announcements: filtered.slice(start, start + safePageSize), page: Math.min(safePage, pageCount), pageCount };
  }
  const supabase = await createServerClient();
  let query = supabase.from("announcements").select("id, title, tag, body, created_at, media_id", { count: "exact" }).eq("published", true);
  if (tag) query = query.eq("tag", tag);
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range((safePage - 1) * safePageSize, safePage * safePageSize - 1);
  if (error) throw new Error(`Unable to load announcements: ${error.message}`);
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / safePageSize));
  const media = await attachAnnouncementMedia(supabase, data ?? []);
  return {
    announcements: (data ?? []).map((row) => toAnnouncement(row, row.media_id ? media.get(row.media_id) : undefined)),
    page: Math.min(safePage, pageCount),
    pageCount,
  };
});

export const getArchivedAnnouncements = cache(async (limit = 100, from?: string, to?: string): Promise<Announcement[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerClient();
  let query = supabase
    .from("announcements")
    .select("id, title, tag, body, created_at, effective_date, media_id")
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false })
    .limit(limit);
  if (from) query = query.gte("effective_date", from);
  if (to) query = query.lte("effective_date", to);
  const { data: rows, error } = await query;
  if (error) throw new Error(`Unable to load archived announcements: ${error.message}`);
  const media = await attachAnnouncementMedia(supabase, rows ?? []);
  return (rows ?? []).map((row) => toAnnouncement(row, row.media_id ? media.get(row.media_id) : undefined));
});

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerClient();
    const { data: row } = await supabase
      .from("announcements")
      .select("id, title, tag, body, created_at, media_id")
      .eq("id", id)
      .or("published.eq.true,archived_at.not.is.null")
      .maybeSingle();
    if (row) {
      const media = row.media_id ? await attachAnnouncementMedia(supabase, [row]) : new Map();
      const image = row.media_id ? media.get(row.media_id) : undefined;
      return {
        id: row.id,
        title: row.title,
        tag: row.tag,
        date: new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date(row.created_at)),
        excerpt: row.body,
        imageUrl: image?.url,
        imageAlt: image?.alt ?? undefined,
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
