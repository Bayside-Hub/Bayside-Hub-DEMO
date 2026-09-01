import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { clubs as staticClubs, slugify, type Club } from "./data";
import type {
  ApprovedClubRow,
  ClubAdvisorRow,
  ClubAnnouncementRow,
  ClubMediaRow,
  ClubMeetingRow,
  ClubOfficerRow,
  ClubRow,
} from "@/lib/supabase/types";
import { preferLiveData } from "./live-data";

const dayNames = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function shortTime(value: string | null) {
  if (!value) return "";
  const [hoursText, minutes = "00"] = value.split(":");
  const hours = Number(hoursText);
  if (!Number.isFinite(hours)) return value;
  const period = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${minutes} ${period}`;
}

function mapDatabaseClub(
  row: ClubRow,
  meetings: ClubMeetingRow[],
  officers: ClubOfficerRow[],
  advisors: ClubAdvisorRow[],
  announcements: ClubAnnouncementRow[],
  media: ClubMediaRow[],
): Club {
  // Every data source is normalized to one small public view model so pages do
  // not depend directly on database/legacy column shapes.
  const firstMeeting = meetings[0];
  const start = shortTime(firstMeeting?.start_time ?? null);
  const end = shortTime(firstMeeting?.end_time ?? null);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.interest_tags[0] ?? (row.is_stem ? "STEM" : row.is_community_service ? "Community Service" : "Other"),
    description: row.short_description,
    meetingDays: [...new Set(meetings.map((meeting) => dayNames[meeting.day_of_week]).filter(Boolean))],
    meetingDate: firstMeeting?.recurrence_note ?? (meetings.length ? "Weekly" : "Schedule TBA"),
    meetingTime: start ? `${start}${end ? ` – ${end}` : ""}` : "TBA",
    location: firstMeeting?.location ?? "TBA",
    commitment: 0,
    communityService: row.is_community_service,
    stem: row.is_stem,
    officers: officers.map((officer) => ({ role: officer.title, name: officer.display_name ?? "Officer" })),
    advisors: advisors.map((advisor) => ({
      name: advisor.display_name ?? "Club Advisor",
      email: advisor.contact_email ?? undefined,
    })),
    activeStartDate: row.active_start_date ?? undefined,
    activeEndDate: row.active_end_date ?? undefined,
    googleClassroomCode: row.google_classroom_code ?? undefined,
    contactEmail: row.contact_email ?? undefined,
    joinPolicy: row.join_policy,
    announcements: announcements.map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      date: announcement.created_at,
    })),
    media: media.map((item) => ({
      id: item.id,
      type: item.media_type,
      path: item.storage_path,
      title: item.title ?? undefined,
      alt: item.alt_text ?? undefined,
    })),
  };
}

export function mapApprovedClub(row: ApprovedClubRow): Club {
  return {
    slug: `${slugify(row.club_name)}-${row.id.slice(0, 8)}`,
    name: row.club_name,
    category: row.category,
    description: row.description,
    meetingDays: row.meeting_days
      ? row.meeting_days.split(/\s*,\s*/).filter(Boolean)
      : [],
    meetingDate: "See meeting days",
    meetingTime: "TBA",
    location: "TBA",
    commitment: 0,
    communityService: row.category === "Community Service",
    stem: row.category === "STEM",
    officers: [],
  };
}

/**
 * All public clubs: the static directory plus club applications that an
 * administrator approved — approved charters go live automatically.
 */
export const getAllClubs = cache(async (): Promise<Club[]> => {
  if (!isSupabaseConfigured()) return staticClubs;

  const supabase = await createServerClient();
  const { data: canonicalRows, error: canonicalError } = await supabase
    .from("clubs")
    .select("id, slug, name, short_description, interest_tags, is_stem, is_community_service, active_start_date, active_end_date, google_classroom_code, contact_email, join_policy, status, created_by, created_at, updated_at")
    .eq("status", "published")
    .order("name");

  if (!canonicalError && canonicalRows?.length) {
    // Fetch relations in parallel to avoid one database round trip per club.
    const ids = canonicalRows.map((row) => row.id);
    const [meetingResult, officerResult, advisorResult, announcementResult, mediaResult] = await Promise.all([
      supabase.from("club_meetings").select("*").in("club_id", ids).order("day_of_week"),
      supabase.from("club_officers").select("*").in("club_id", ids).order("title"),
      supabase.from("club_advisors").select("*").in("club_id", ids),
      supabase.from("club_announcements").select("*").in("club_id", ids).eq("published", true).order("created_at", { ascending: false }),
      supabase.from("club_media").select("*").in("club_id", ids).order("created_at", { ascending: false }),
    ]);
    const canonical = canonicalRows.map((row) => mapDatabaseClub(
      row,
      (meetingResult.data ?? []).filter((item) => item.club_id === row.id),
      (officerResult.data ?? []).filter((item) => item.club_id === row.id),
      (advisorResult.data ?? []).filter((item) => item.club_id === row.id),
      (announcementResult.data ?? []).filter((item) => item.club_id === row.id),
      (mediaResult.data ?? [])
        .filter((item) => item.club_id === row.id)
        .map((item) => ({
          ...item,
          storage_path: supabase.storage.from("club-media").getPublicUrl(item.storage_path).data.publicUrl,
        })),
    ));
    return canonical;
  }

  // Keep legacy approved applications readable while older deployments migrate.
  const { data: rows, error } = await supabase
    .from("approved_clubs")
    .select("id, club_name, category, description, meeting_days, created_at")
    .order("created_at", { ascending: false });

  if (error) return staticClubs;

  const approved: Club[] = (rows ?? []).map(mapApprovedClub);

  return preferLiveData(approved, staticClubs);
});

/** Look up a single club by slug across static + approved applications. */
export async function getClubBySlug(slug: string): Promise<Club | null> {
  const all = await getAllClubs();
  return (
    all.find((club) => club.slug === slug) ??
    all.find((club) => slugify(club.name) === slug) ??
    null
  );
}
