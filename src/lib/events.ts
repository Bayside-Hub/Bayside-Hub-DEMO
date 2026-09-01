import { cache } from "react";
import { events as seedEvents, type EventItem } from "./data";
import { isSupabaseConfigured } from "./supabase/config";
import { createServerClient } from "./supabase/server";
import type { EventRow } from "./supabase/types";
import { normalizeRecordId, preferLiveData } from "./live-data";

function formatDate(startAt: string, endAt: string | null) {
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;
  const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
  return end && start.toDateString() !== end.toDateString()
    ? `${formatter.format(start)} – ${formatter.format(end)}`
    : formatter.format(start);
}

function mapEvent(row: EventRow): EventItem {
  const start = new Date(row.start_at);
  const end = row.end_at ? new Date(row.end_at) : null;
  return {
    id: normalizeRecordId(row.id),
    title: row.title,
    category: row.event_type === "sports" ? "sports" : row.event_type === "spirit_week" ? "spirit-week" : "events",
    date: formatDate(row.start_at, row.end_at),
    dateISO: row.start_at.slice(0, 10),
    dateEndISO: row.end_at?.slice(0, 10),
    time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(start)
      + (end ? ` – ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(end)}` : ""),
    location: row.location ?? "Location TBA",
    price: row.price_label,
    description: row.description,
    source: row.event_type === "club" ? "club" : row.event_type === "sports" ? "sports" : "school",
  };
}

function meetingEvents(
  meetings: { id: string; club_id: string; day_of_week: number; start_time: string | null; end_time: string | null; location: string | null; recurrence_note: string | null }[],
  clubs: { id: string; slug: string; name: string; active_start_date: string | null; active_end_date: string | null }[],
): EventItem[] {
  const clubsById = new Map(clubs.map((club) => [club.id, club]));
  const start = new Date();
  start.setDate(start.getDate() - 35);
  const end = new Date();
  end.setDate(end.getDate() + 120);
  const output: EventItem[] = [];
  for (const meeting of meetings) {
    const club = clubsById.get(meeting.club_id);
    if (!club) continue;
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    while (cursor <= end) {
      const isoDay = cursor.getDay() === 0 ? 7 : cursor.getDay();
      const dateISO = [cursor.getFullYear(), String(cursor.getMonth() + 1).padStart(2, "0"), String(cursor.getDate()).padStart(2, "0")].join("-");
      if (
        isoDay === meeting.day_of_week
        && (!club.active_start_date || dateISO >= club.active_start_date)
        && (!club.active_end_date || dateISO <= club.active_end_date)
      ) {
        output.push({
          id: `meeting-${meeting.id}-${dateISO}`,
          title: `${club.name} Meeting`,
          category: "events",
          date: new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(cursor),
          dateISO,
          time: `${shortTime(meeting.start_time)}${meeting.end_time ? ` – ${shortTime(meeting.end_time)}` : ""}` || "Time TBA",
          location: meeting.location ?? "Location TBA",
          price: "Free",
          description: meeting.recurrence_note ?? `Regular meeting for ${club.name}.`,
          source: "club",
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return output;
}

function shortTime(value: string | null) {
  if (!value) return "";
  const [hoursText, minutes = "00"] = value.split(":");
  const hours = Number(hoursText);
  return `${hours % 12 || 12}:${minutes} ${hours >= 12 ? "PM" : "AM"}`;
}

export const getEvents = cache(async (): Promise<EventItem[]> => {
  if (!isSupabaseConfigured()) return seedEvents;
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("published", true)
    .order("start_at");
  if (error) return seedEvents;
  const [meetingResult, clubResult] = await Promise.all([
    supabase.from("club_meetings").select("id, club_id, day_of_week, start_time, end_time, location, recurrence_note"),
    supabase.from("clubs").select("id, slug, name, active_start_date, active_end_date").eq("status", "published"),
  ]);
  const live = (data ?? []).map(mapEvent);
  const recurring = meetingResult.error || clubResult.error
    ? []
    : meetingEvents(meetingResult.data ?? [], clubResult.data ?? []);
  return preferLiveData([...live, ...recurring], seedEvents);
});

export async function getEvent(id: string) {
  return (await getEvents()).find((event) => event.id === id) ?? null;
}
