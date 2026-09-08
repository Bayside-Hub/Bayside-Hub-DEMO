"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import { parseOptionalDateOnly } from "@/lib/input-validation";
import { parseMeetingInput, parseClubPostInput } from "@/lib/club-content-input";
import { MAX_IMAGE_UPLOAD_BYTES } from "@/lib/upload-limits";

const denied = { ok: false, message: "You no longer have permission for this club. Refresh or contact your advisor." };
const invalid = { ok: false, message: "Check the required fields, lengths and dates, then try again." };
const failed = { ok: false, message: "Nothing was saved. Check your permissions and database setup, then try again." };
const saved = { ok: true, message: "Saved successfully." };

/** Publication is a staff decision; club editors retain ordinary content access. */
export async function updateClubPublication(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context || !["staff", "admin"].includes(context.user.role)) return denied;
  const status = String(formData.get("status") ?? "");
  if (!["draft", "published", "archived"].includes(status)) return invalid;
  const { data, error } = await context.supabase.from("clubs").update({ status: status as "draft" | "published" | "archived" }).eq("id", clubId).select("id").maybeSingle();
  if (error || !data) return failed;
  revalidatePath("/clubs", "layout");
  return { ok: true, message: `Club status changed to ${status}.` };
}

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
  const [manage, govern] = await Promise.all([
    supabase.rpc("can_manage_club", { p_club_id: clubId }),
    supabase.rpc("can_govern_club", { p_club_id: clubId }),
  ]);
  if (manage.data) return { user, supabase, canGovern: govern.data === true };
  return null;
}

export async function updateManagedClub(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const context = await managerContext(clubId);
  if (!context) return denied;
  const description = String(formData.get("short_description") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();
  if (description.length < 10 || description.length > 1000) return invalid;
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return invalid;
  const tags = String(formData.get("interest_tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 12);
  const activeStartDate = parseOptionalDateOnly(String(formData.get("active_start_date") ?? ""));
  const activeEndDate = parseOptionalDateOnly(String(formData.get("active_end_date") ?? ""));
  if (activeStartDate === undefined || activeEndDate === undefined) return invalid;
  if (activeStartDate && activeEndDate && activeEndDate < activeStartDate) return invalid;
  const { data, error } = await context.supabase.from("clubs").update({
    short_description: description,
    interest_tags: tags,
    is_stem: formData.get("is_stem") === "on",
    is_community_service: formData.get("is_community_service") === "on",
    active_start_date: activeStartDate,
    active_end_date: activeEndDate,
    google_classroom_code: String(formData.get("google_classroom_code") ?? "").trim() || null,
    contact_email: contactEmail || null,
    join_policy: formData.get("join_policy") === "instant" ? "instant" : "approval_required",
  }).eq("id", clubId).select("id").maybeSingle();
  if (error || !data) return failed;
  revalidatePath(`/clubs/${slug}`);
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs");
  return saved;
}

export async function addClubMeeting(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context) return denied;
  const meeting = parseMeetingInput(formData);
  if (!meeting) return invalid;
  const { error } = await context.supabase.from("club_meetings").insert({
    club_id: clubId,
    ...meeting,
  });
  if (error) return failed;
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/calendar");
  revalidatePath("/clubs", "layout");
  return saved;
}

export async function publishClubAnnouncement(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context) return denied;
  const post = parseClubPostInput(formData);
  if (!post) return invalid;
  const { error } = await context.supabase.from("club_announcements").insert({
    club_id: clubId,
    ...post,
    published_by: context.user.id,
  });
  if (error) return failed;
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs", "layout");
  return { ok: true, message: "Published to this club. School-wide announcements require a separate review submission." };
}

/** Pair record id with club id on every write; form fields alone never grant access. */
export async function editClubMeeting(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context) return denied;
  const meeting = parseMeetingInput(formData);
  if (!meeting) return invalid;
  const { data, error } = await context.supabase.from("club_meetings").update(meeting)
    .eq("id", String(formData.get("record_id") ?? "")).eq("club_id", clubId).select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "Meeting not updated. It may have been removed or your access changed." };
  revalidatePath("/clubs", "layout");
  revalidatePath("/calendar");
  return saved;
}

export async function editClubPost(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context) return denied;
  const post = parseClubPostInput(formData);
  if (!post) return invalid;
  const { data, error } = await context.supabase.from("club_announcements").update({ ...post, published: formData.get("published") === "on", updated_at: new Date().toISOString() })
    .eq("id", String(formData.get("record_id") ?? "")).eq("club_id", clubId).select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "Post not updated. It may have been removed or your access changed." };
  revalidatePath("/clubs", "layout");
  return saved;
}

async function deleteClubContent(formData: FormData, table: "club_meetings" | "club_announcements") {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context) return denied;
  if (formData.get("confirm") !== "yes") return { ok: false, message: "Confirm deletion before continuing." };
  const { data, error } = await context.supabase.from(table).delete()
    .eq("id", String(formData.get("record_id") ?? "")).eq("club_id", clubId).select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "Nothing was deleted. The record may no longer exist or your access changed." };
  revalidatePath("/clubs", "layout");
  if (table === "club_meetings") revalidatePath("/calendar");
  return { ok: true, message: "Deleted. This does not delete other club content." };
}

export async function deleteClubMeeting(formData: FormData) { return deleteClubContent(formData, "club_meetings"); }
export async function deleteClubPost(formData: FormData) { return deleteClubContent(formData, "club_announcements"); }

export async function reviewClubMembership(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const membershipId = String(formData.get("membership_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const context = await managerContext(clubId);
  if (!context?.canGovern) return denied;
  if (!["active", "rejected"].includes(status)) return invalid;
  const { data, error } = await context.supabase.from("club_memberships").update({
    status: status as "active" | "rejected",
    reviewed_at: new Date().toISOString(),
    reviewed_by: context.user.id,
  }).eq("id", membershipId).eq("club_id", clubId).eq("status", "pending").select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "The request was not changed. It may have been reviewed already." };
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/profile");
  return saved;
}

export async function addClubOfficer(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context?.canGovern) return denied;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const termStart = parseOptionalDateOnly(String(formData.get("term_start") ?? ""));
  const termEnd = parseOptionalDateOnly(String(formData.get("term_end") ?? ""));
  if (!email || title.length < 2 || title.length > 80 || termStart === undefined || termEnd === undefined) return invalid;
  if (termStart && termEnd && termEnd < termStart) return invalid;

  const { data: profile } = await context.supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("email", email)
    .maybeSingle();
  if (!profile) return { ok: false, message: "No accessible member with that email. Approve their club membership first." };
  // An officer must already be an active member. Appointment never bypasses
  // the normal membership review workflow or creates membership implicitly.
  const { data: membership } = await context.supabase
    .from("club_memberships")
    .select("id")
    .eq("club_id", clubId)
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .maybeSingle();
  if (!membership) return { ok: false, message: "Board members must first have active membership in this club." };

  const { error } = await context.supabase.from("club_officers").insert({
    club_id: clubId,
    profile_id: profile.id,
    display_name: profile.full_name ?? profile.email,
    title,
    term_start: termStart,
    term_end: termEnd,
  });
  if (error) return failed;
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs/manage");
  revalidatePath("/clubs");
  return saved;
}

export async function removeClubOfficer(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const officerId = String(formData.get("officer_id") ?? "");
  const context = await managerContext(clubId);
  if (!context?.canGovern || !officerId) return denied;
  const { data, error } = await context.supabase.from("club_officers").delete().eq("id", officerId).eq("club_id", clubId).select("id").maybeSingle();
  if (error || !data) return failed;
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs/manage");
  revalidatePath("/clubs");
  return saved;
}

export async function addClubAdvisor(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context || !["staff", "admin"].includes(context.user.role)) return denied;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const { data: profile } = await context.supabase.from("profiles").select("id, full_name, email, role").eq("email", email).maybeSingle();
  if (!profile || !["teacher", "advisor", "staff", "admin"].includes(profile.role)) return { ok: false, message: "Choose a registered Teacher, Advisor, Staff or Admin account." };
  const { error } = await context.supabase.from("club_advisors").upsert({
    club_id: clubId,
    profile_id: profile.id,
    display_name: profile.full_name ?? profile.email,
    contact_email: profile.email,
  }, { onConflict: "club_id,profile_id" });
  if (error) return failed;
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs");
  return saved;
}

export async function uploadClubImage(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  const image = formData.get("image");
  const title = String(formData.get("title") ?? "").trim();
  const altText = String(formData.get("alt_text") ?? "").trim();
  if (!context) return denied;
  if (!(image instanceof File) || !altText || altText.length > 240 || title.length > 120) return invalid;
  if (image.size <= 0 || image.size > MAX_IMAGE_UPLOAD_BYTES || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(image.type)) return { ok: false, message: "Choose a JPG, PNG, WebP or GIF image up to 4 MB." };
  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" } as Record<string, string>)[image.type];
  const storagePath = `${clubId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await context.supabase.storage.from("club-media").upload(storagePath, image, { contentType: image.type, upsert: false });
  if (uploadError) return { ok: false, message: "Image upload failed. Check the club-media bucket, its policies and your access." };
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
  if (rowError) {
    const { error: cleanupError } = await context.supabase.storage.from("club-media").remove([storagePath]);
    return { ok: false, message: cleanupError ? "Photo metadata failed, and file cleanup failed. Contact Support before retrying." : "Photo metadata could not be saved. The uploaded file was removed." };
  }
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs", "layout");
  return { ok: true, message: "Photo uploaded. Images in this gallery have public URLs; upload only approved photos." };
}

export async function deleteClubImage(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const mediaId = String(formData.get("media_id") ?? "");
  const context = await managerContext(clubId);
  if (!context || !mediaId) return denied;
  const { data: media } = await context.supabase.from("club_media").select("storage_path").eq("id", mediaId).eq("club_id", clubId).maybeSingle();
  if (!media) return { ok: false, message: "Photo not found or no longer accessible." };
  const { error } = await context.supabase.storage.from("club-media").remove([media.storage_path]);
  if (error) return { ok: false, message: "The photo file could not be deleted. Try again later." };
  const { error: rowError } = await context.supabase.from("club_media").delete().eq("id", mediaId).eq("club_id", clubId);
  if (rowError) return { ok: false, message: "File removed, but the gallery entry could not be removed. Refresh and retry deleting this entry." };
  revalidatePath(`/clubs/manage/${clubId}`);
  revalidatePath("/clubs", "layout");
  return { ok: true, message: "Photo removed from the gallery and storage." };
}

export async function updateClubCompliance(formData: FormData) {
  const clubId = String(formData.get("club_id") ?? "");
  const context = await managerContext(clubId);
  if (!context) return denied;
  const schoolYear = String(formData.get("school_year") ?? "").trim();
  const rosterCount = Number(formData.get("roster_count"));
  if (!/^\d{4}-\d{4}$/.test(schoolYear) || !Number.isInteger(rosterCount) || rosterCount < 0 || rosterCount > 10000) return invalid;
  const firstYear = Number(schoolYear.slice(0, 4));
  if (Number(schoolYear.slice(5)) !== firstYear + 1) return invalid;
  const { error } = await context.supabase.from("club_compliance").upsert({
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
  if (error) return failed;
  revalidatePath(`/clubs/manage/${clubId}`);
  return saved;
}
