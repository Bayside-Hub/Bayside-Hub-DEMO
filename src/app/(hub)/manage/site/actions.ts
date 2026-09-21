"use server";
import { getCurrentUser } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { siteTextDefaults } from "@/lib/site-content";
import { revalidatePath } from "next/cache";

async function siteEditor() {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await createServerClient();
  const { data: allowed } = await db.rpc("has_custom_permission", { p_permission: "site.manage" });
  return ["staff", "admin"].includes(user.role) || allowed ? { user, db } : null;
}

export async function saveSiteDraft(key: string, body: string) {
  const context = await siteEditor();
  if (!context) return "You do not have permission to edit public content.";
  if (!Object.hasOwn(siteTextDefaults, key) || body.length > 4000) return "Draft is too long or uses an unknown field.";
  const { error } = await context.db.from("site_content_drafts").upsert({ user_id: context.user.id, key, body, updated_at: new Date().toISOString() });
  return error ? "Draft could not be saved. Apply site_cms_workflow.sql." : "Draft saved.";
}

/** Enforce capability on every write, even if an old editor tab stays open. */
export async function saveSiteText(_state: string, form: FormData) {
  const context = await siteEditor();
  if (!context) return "You do not have permission to edit public content.";
  const key = String(form.get("key") ?? "");
  const body = String(form.get("body") ?? "").trim();
  const optionalKeys = new Set(["footer_contact", "support_location"]);
  if (!Object.hasOwn(siteTextDefaults, key) || (!body && !optionalKeys.has(key)) || body.length > 4000) return "Enter 1–4,000 characters in a supported field; only contact and location may be blank.";
  const rawTime = String(form.get("publish_at") ?? "");
  const publishAt = rawTime ? new Date(rawTime) : null;
  if (publishAt && Number.isNaN(publishAt.getTime())) return "Enter a valid publication time.";
  const scheduled = publishAt && publishAt.getTime() > Date.now();
  const { error } = scheduled
    ? await context.db.from("site_content_scheduled").upsert({ key, body, publish_at: publishAt.toISOString(), updated_by: context.user.id, updated_at: new Date().toISOString() })
    : await context.db.from("site_content").upsert({ key, body, updated_by: context.user.id, updated_at: new Date().toISOString() });
  if (error) return "Unable to save. Check database setup and your permissions.";
  if (!scheduled) await context.db.from("site_content_scheduled").delete().eq("key", key);
  await context.db.from("site_content_drafts").delete().eq("user_id", context.user.id).eq("key", key);
  revalidatePath("/", "layout");
  return scheduled ? "Scheduled. Public text will change at the selected time." : "Saved. Public pages now use this text.";
}

export async function restoreSiteTextVersion(_state: string, form: FormData) {
  const context = await siteEditor();
  if (!context) return "You do not have permission to edit public content.";
  if (form.get("confirm") !== "yes") return "Confirm restoration first.";
  const key = String(form.get("key") ?? "");
  const id = String(form.get("version_id") ?? "");
  if (!Object.hasOwn(siteTextDefaults, key)) return "Unknown field.";
  const { data: version } = await context.db.from("site_content_versions").select("snapshot_body").eq("id", id).eq("key", key).maybeSingle();
  if (!version) return "Version not found.";
  const { error } = await context.db.from("site_content").upsert({ key, body: version.snapshot_body, updated_by: context.user.id, updated_at: new Date().toISOString() });
  if (error) return "Could not restore this version.";
  await context.db.from("site_content_scheduled").delete().eq("key", key);
  await context.db.from("site_content_drafts").delete().eq("user_id", context.user.id).eq("key", key);
  revalidatePath("/", "layout");
  return "Restored. This version is live now.";
}
