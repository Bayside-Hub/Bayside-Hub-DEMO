"use server";
import { getCurrentUser } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { siteTextDefaults } from "@/lib/site-content";
import { revalidatePath } from "next/cache";

/** Enforce capability on every write, even if an old editor tab stays open. */
export async function saveSiteText(_state: string, form: FormData) {
  const user = await getCurrentUser();
  if (!user) return "Sign in before editing.";
  const db = await createServerClient();
  const { data: allowed } = await db.rpc("has_custom_permission", { p_permission: "site.manage" });
  if (!["staff", "admin"].includes(user.role) && !allowed) return "You do not have permission to edit public content.";
  const key = String(form.get("key") ?? "");
  const body = String(form.get("body") ?? "").trim();
  const optionalKeys = new Set(["footer_contact", "support_location"]);
  if (!Object.hasOwn(siteTextDefaults, key) || (!body && !optionalKeys.has(key)) || body.length > 4000) return "Enter 1–4,000 characters in a supported field; only contact and location may be blank.";
  const { error } = await db.from("site_content").upsert({ key, body, updated_by: user.id, updated_at: new Date().toISOString() });
  if (error) return "Unable to save. Check database setup and your permissions.";
  revalidatePath("/", "layout");
  return "Saved. Public pages now use this text.";
}
