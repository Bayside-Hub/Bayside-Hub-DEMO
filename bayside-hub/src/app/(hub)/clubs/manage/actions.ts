"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import { isValidOptionalTime, parseOptionalDateOnly } from "@/lib/input-validation";

/**
 * Resolves club-scoped authorization for every management mutation.
 * Officers can maintain content; advisors and staff also receive governance
 * powers. PostgreSQL RLS repeats this check as the final security boundary.
 */
async function managerContext(clubId: string) {
  const user = await getCurrentUser();
  if (!user || !clubId || !isSupabaseConfigured()) return null;
  const supabase = await createServerClient();
  if (["staff", "admin"].includes(user.role)) return { user, supabase, canGovern: true };
  const [advisorResult, officerResult] = await Promise.all([
    supabase.from("club_advisors").select("id").eq("club_id", clubId).eq("profile_id", user.id).maybeSingle(),
    supabase.from("club_officers").select("id").eq("club_id", clubId).eq("profile_id", user.id).maybeSingle(),
  ]);
  if (advisorResult.data) return { user, supabase, canGovern: true };
  if (officerResult.data) return { user, supabase, canGovern: false };
  return null;
}

export async function updateManagedClub(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const context = await managerContext(clubId);
  if (!context) return;
  const description = String(formData.get("short_description") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();
  if (description.length < 10 || description.length > 1000) return;
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return;
  const tags = String(formData.get("interest_tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 12);
  const activeStartDate = parseOptionalDateOnly(String(formData.get("active_start_date") ?? ""));
  const activeEndDate = parseOptionalDateOnly(String(formData.get("active_end_date") ?? ""));
  if (activeStartDate === undefined || activeEndDate === undefined) return;
  if (activeStartDate && activeEndDate && activeEndDate < activeStartDate) return;
  await context.supabase.from("clubs").update({
    short_description: description,
    interest_tags: tags,
    is_stem: formData.get("is_stem") === "on",
    is_community_service: formData.get("is_community_service") === "on",
    active_start_date: activeStartDate,
    active_end_date: activeEndDate,
    google_classroom_code: String(formData.get("google_classroom_code") ?? "").trim() || null,
    contact_email: contactEmail || null,
    join_policy: formData.get("join_policy") === "instant" ? "instant" : "approval_required",
  }).eq("id", clubId);
  revalidatePath(`/clubs/${slug}`);
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs");
}

export async function addClubMeeting(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context) return;
  const day = Number(formData.get("day_of_week"));
  if (!Number.isInteger(day) || day < 1 || day > 7) return;
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "");
  if (!isValidOptionalTime(startTime) || !isValidOptionalTime(endTime)) return;
  if (startTime && endTime && endTime <= startTime) return;
  await context.supabase.from("club_meetings").insert({
    club_id: clubId,
    day_of_week: day,
    start_time: startTime || null,
    end_time: endTime || null,
    location: String(formData.get("location") ?? "").trim() || null,
    recurrence_note: String(formData.get("recurrence_note") ?? "").trim() || null,
  });
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/calendar");
}

export async function publishClubAnnouncement(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context) return;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (title.length < 3 || title.length > 120 || body.length < 3 || body.length > 4000) return;
  await context.supabase.from("club_announcements").insert({
    club_id: clubId,
    title,
    body,
    published_by: context.user.id,
  });
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs");
}

export async function reviewClubMembership(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const membershipId = String(formData.get("membership_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const context = await managerContext(clubId);
  if (!context?.canGovern || !["active", "rejected"].includes(status)) return;
  await context.supabase.from("club_memberships").update({
    status: status as "active" | "rejected",
    reviewed_at: new Date().toISOString(),
    reviewed_by: context.user.id,
  }).eq("id", membershipId).eq("club_id", clubId).eq("status", "pending");
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/profile");
}

export async function addClubOfficer(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context?.canGovern) return;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const termStart = parseOptionalDateOnly(String(formData.get("term_start") ?? ""));
  const termEnd = parseOptionalDateOnly(String(formData.get("term_end") ?? ""));
  if (!email || title.length < 2 || title.length > 80 || termStart === undefined || termEnd === undefined) return;
  if (termStart && termEnd && termEnd < termStart) return;

  const { data: profile } = await context.supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("email", email)
    .maybeSingle();
  if (!profile) return;
  // An officer must already be an active member. Appointment never bypasses
  // the normal membership review workflow or creates membership implicitly.
  const { data: membership } = await context.supabase
    .from("club_memberships")
    .select("id")
    .eq("club_id", clubId)
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .maybeSingle();
  if (!membership) return;

  await context.supabase.from("club_officers").insert({
    club_id: clubId,
    profile_id: profile.id,
    display_name: profile.full_name ?? profile.email,
    title,
    term_start: termStart,
    term_end: termEnd,
  });
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs/manage");
  revalidatePath("/clubs");
}

export async function removeClubOfficer(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const officerId = String(formData.get("officer_id") ?? "");
  const context = await managerContext(clubId);
  if (!context?.canGovern || !officerId) return;
  await context.supabase.from("club_officers").delete().eq("id", officerId).eq("club_id", clubId);
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs/manage");
  revalidatePath("/clubs");
}

export async function addClubAdvisor(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context || !["staff", "admin"].includes(context.user.role)) return;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const { data: profile } = await context.supabase.from("profiles").select("id, full_name, email, role").eq("email", email).maybeSingle();
  if (!profile || !["advisor", "staff", "admin"].includes(profile.role)) return;
  await context.supabase.from("club_advisors").upsert({
    club_id: clubId,
    profile_id: profile.id,
    display_name: profile.full_name ?? profile.email,
    contact_email: profile.email,
  }, { onConflict: "club_id,profile_id" });
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs");
}

export async function uploadClubImage(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  const image = formData.get("image");
  const title = String(formData.get("title") ?? "").trim();
  const altText = String(formData.get("alt_text") ?? "").trim();
  if (!context || !(image instanceof File) || !altText || altText.length > 240 || title.length > 120) return;
  if (image.size <= 0 || image.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(image.type)) return;
  const extension = image.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "image";
  const storagePath = `${clubId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await context.supabase.storage.from("club-media").upload(storagePath, image, { contentType: image.type, upsert: false });
  if (uploadError) return;
  const { error: rowError } = await context.supabase.from("club_media").insert({
    club_id: clubId,
    media_type: "image",
    storage_path: storagePath,
    title: title || null,
    alt_text: altText,
    uploaded_by: context.user.id,
  });
  // Storage and Postgres are separate systems; roll back the object when its
  // metadata row fails so an inaccessible orphan file is not retained.
  if (rowError) await context.supabase.storage.from("club-media").remove([storagePath]);
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs");
}

export async function deleteClubImage(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const mediaId = String(formData.get("media_id") ?? "");
  const context = await managerContext(clubId);
  if (!context || !mediaId) return;
  const { data: media } = await context.supabase.from("club_media").select("storage_path").eq("id", mediaId).eq("club_id", clubId).maybeSingle();
  if (!media) return;
  const { error } = await context.supabase.storage.from("club-media").remove([media.storage_path]);
  if (error) return;
  await context.supabase.from("club_media").delete().eq("id", mediaId).eq("club_id", clubId);
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs");
}

export async function updateClubCompliance(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context) return;
  const schoolYear = String(formData.get("school_year") ?? "").trim();
  const rosterCount = Number(formData.get("roster_count"));
  if (!/^\d{4}-\d{4}$/.test(schoolYear) || !Number.isInteger(rosterCount) || rosterCount < 0 || rosterCount > 10000) return;
  const firstYear = Number(schoolYear.slice(0, 4));
  if (Number(schoolYear.slice(5)) !== firstYear + 1) return;
  await context.supabase.from("club_compliance").upsert({
    club_id: clubId,
    school_year: schoolYear,
    roster_count: rosterCount,
    constitution_on_file: formData.get("constitution_on_file") === "on",
    college_alignment_on_file: formData.get("college_alignment_on_file") === "on",
    annual_event_completed: formData.get("annual_event_completed") === "on",
    community_service_completed: formData.get("community_service_completed") === "on",
    fundraiser_completed: formData.get("fundraiser_completed") === "on",
    updated_by: context.user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: "club_id,school_year" });
  revalidatePath(`/clubs/manage/${clubId}`);
}
