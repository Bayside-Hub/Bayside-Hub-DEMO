"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth";
import { announcementTags, parseOptionalIsoDateTime } from "@/lib/input-validation";

export type ActionState = { ok: boolean; message: string } | null;

function invalid(): ActionState {
  return { ok: false, message: "Something went wrong. Try again." };
}

export async function createAnnouncement(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  const title = String(formData.get("title") ?? "").trim();
  const tag = String(formData.get("tag") ?? "Announcements").trim();
  const body = String(formData.get("body") ?? "").trim();
  const versionNote = String(formData.get("version_note") ?? "Initial publication").trim();

  if (!user || !["staff", "admin"].includes(user.role)) {
    return { ok: false, message: "Staff only." };
  }
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Supabase is not configured. Add the env keys in .env.local to publish.",
    };
  }
  if (title.length < 3 || title.length > 120 || body.length < 3 || body.length > 10000) {
    return { ok: false, message: "Use a 3–120 character title and 3–10,000 character body." };
  }
  if (!announcementTags.includes(tag as (typeof announcementTags)[number])) return invalid();
  if (versionNote.length > 240) return { ok: false, message: "Version notes must be 240 characters or fewer." };

  const supabase = await createServerClient();
  const { error } = await supabase.from("announcements").insert({
    title,
    tag,
    body,
    created_by: user.id,
    updated_by: user.id,
    version_note: versionNote.slice(0, 240) || "Initial publication",
    published: true,
  });

  if (error) return invalid();

  revalidatePath("/announcements");
  revalidatePath("/");
  revalidatePath("/admin/announcements");
  return { ok: true, message: "Announcement published." };
}

export async function deleteAnnouncement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const id = String(formData.get("id") ?? "");

  if (!user || !["staff", "admin"].includes(user.role)) return { ok: false, message: "Staff only." };
  if (!isSupabaseConfigured() || !id) return invalid();

  const supabase = await createServerClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return invalid();

  revalidatePath("/announcements");
  revalidatePath("/");
  revalidatePath("/admin/announcements");
  return { ok: true, message: "Announcement deleted." };
}

export async function archiveAnnouncement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const id = String(formData.get("id") ?? "");
  if (!user || !["staff", "admin"].includes(user.role)) return { ok: false, message: "Staff only." };
  if (!isSupabaseConfigured() || !id) return invalid();

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("announcements")
    .update({
      published: false,
      archived_at: new Date().toISOString(),
      updated_by: user.id,
      version_note: "Archived",
    })
    .eq("id", id);
  if (error) return invalid();

  revalidatePath("/");
  revalidatePath("/announcements");
  revalidatePath("/announcements/archive");
  revalidatePath("/admin/announcements");
  return { ok: true, message: "Announcement archived." };
}

export async function restoreAnnouncement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const id = String(formData.get("id") ?? "");
  if (!user || !["staff", "admin"].includes(user.role)) return { ok: false, message: "Staff only." };
  if (!isSupabaseConfigured() || !id) return invalid();
  const supabase = await createServerClient();
  const { error } = await supabase.from("announcements").update({ published: true, archived_at: null, updated_by: user.id, version_note: "Restored" }).eq("id", id);
  if (error) return invalid();
  revalidatePath("/");
  revalidatePath("/announcements");
  revalidatePath("/announcements/archive");
  revalidatePath("/admin/announcements");
  return { ok: true, message: "Announcement restored." };
}

export async function updateAnnouncement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const tag = String(formData.get("tag") ?? "Announcements");
  const body = String(formData.get("body") ?? "").trim();
  const versionNote = String(formData.get("version_note") ?? "").trim();
  if (!user || !["staff", "admin"].includes(user.role)) return { ok: false, message: "Staff only." };
  if (!isSupabaseConfigured() || !id || title.length < 3 || title.length > 120 || body.length < 3 || body.length > 10000 || !versionNote || versionNote.length > 240) return invalid();
  if (!announcementTags.includes(tag as (typeof announcementTags)[number])) return invalid();
  const supabase = await createServerClient();
  const { error } = await supabase.from("announcements").update({ title, tag, body, updated_by: user.id, version_note: versionNote.slice(0, 240) }).eq("id", id);
  if (error) return invalid();
  revalidatePath(`/announcements/${id}`);
  revalidatePath(`/admin/announcements/${id}`);
  revalidatePath("/announcements");
  revalidatePath("/");
  return { ok: true, message: "Announcement updated and version saved." };
}

export async function setApplicationStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!user || !["staff", "admin"].includes(user.role)) return { ok: false, message: "Staff only." };
  if (!isSupabaseConfigured() || !id) return invalid();
  if (!["approved", "rejected"].includes(status)) return invalid();

  const supabase = await createServerClient();
  const nextStatus = status as "approved" | "rejected";
  const { error } = await supabase
    .from("club_applications")
    .update({ status: nextStatus, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq("id", id);

  if (error) return invalid();

  revalidatePath("/admin/clubs");
  revalidatePath("/admin");
  revalidatePath("/clubs");
  return { ok: true, message: `Application ${nextStatus}.` };
}

export async function updateUserRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!user || user.role !== "admin") return { ok: false, message: "Admins only." };
  if (!isSupabaseConfigured() || !id) return invalid();
  if (!["student", "advisor", "staff", "admin"].includes(role)) return invalid();

  const supabase = await createServerClient();
  const { error } = await supabase.rpc("set_user_role", {
    p_user_id: id,
    p_role: role as "student" | "advisor" | "staff" | "admin",
  });

  if (error) return invalid();

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true, message: "Role updated." };
}

export async function setSupportRequestStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!user || !["staff", "admin"].includes(user.role)) return { ok: false, message: "Staff only." };
  if (!isSupabaseConfigured() || !id || !["open", "in_review", "resolved", "closed"].includes(status)) return invalid();
  const supabase = await createServerClient();
  const { error } = await supabase.from("support_requests").update({
    status: status as "open" | "in_review" | "resolved" | "closed",
    assigned_to: user.id,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return invalid();
  revalidatePath("/admin/support");
  revalidatePath("/support");
  return { ok: true, message: "Request updated." };
}

const opportunityCategories = ["election", "community_service", "internship", "pre_college", "discount"] as const;
const opportunityStatuses = ["draft", "in_review", "published", "expired", "archived"] as const;

export async function createOpportunity(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || !["staff", "admin"].includes(user.role)) return { ok: false, message: "Staff only." };
  if (!isSupabaseConfigured()) return invalid();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const eligibility = String(formData.get("eligibility") ?? "").trim();
  const applicationLink = String(formData.get("application_link") ?? "").trim();
  const deadline = String(formData.get("deadline") ?? "");
  if (title.length < 3 || title.length > 120 || description.length < 10 || description.length > 4000) return invalid();
  if (!opportunityCategories.includes(category as (typeof opportunityCategories)[number])) return invalid();
  if (applicationLink) {
    try {
      if (new URL(applicationLink).protocol !== "https:") return { ok: false, message: "Application links must use HTTPS." };
    } catch {
      return { ok: false, message: "Enter a valid application link." };
    }
  }
  const deadlineIso = parseOptionalIsoDateTime(deadline);
  if (deadlineIso === undefined) return { ok: false, message: "Enter a valid deadline." };
  const supabase = await createServerClient();
  const { error } = await supabase.from("opportunities").insert({
    title,
    category: category as (typeof opportunityCategories)[number],
    description,
    eligibility: eligibility || null,
    application_link: applicationLink || null,
    deadline: deadlineIso,
    status: "draft",
    created_by: user.id,
  });
  if (error) return invalid();
  revalidatePath("/admin/opportunities");
  return { ok: true, message: "Opportunity saved as a draft." };
}

export async function setOpportunityStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!user || !["staff", "admin"].includes(user.role)) return { ok: false, message: "Staff only." };
  if (!id || !isSupabaseConfigured() || !opportunityStatuses.includes(status as (typeof opportunityStatuses)[number])) return invalid();
  const supabase = await createServerClient();
  const { error } = await supabase.from("opportunities").update({ status: status as (typeof opportunityStatuses)[number], updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return invalid();
  revalidatePath("/admin/opportunities");
  revalidatePath("/opportunities");
  revalidatePath("/");
  return { ok: true, message: "Opportunity updated." };
}
