"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { parseOptionalDateOnly } from "@/lib/input-validation";
import { createServerClient } from "@/lib/supabase/server";
import type { ClubCustomColumn } from "@/lib/supabase/types";

const denied = { ok: false, message: "Current Club management access is required." };

async function context(clubId: string) {
  const user = await getCurrentUser();
  if (!user || !clubId) return null;
  const db = await createServerClient();
  const access = await db.rpc("can_manage_club", { p_club_id: clubId });
  return access.data ? { user, db } : null;
}

export async function createCustomTable(form: FormData) {
  const clubId = String(form.get("club_id") ?? "");
  const current = await context(clubId);
  if (!current) return denied;
  const name = String(form.get("name") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const labels = form.getAll("column_label").map(value => String(value).trim());
  const types = form.getAll("column_type").map(value => String(value));
  const required = new Set(form.getAll("column_required").map(String));
  if (name.length < 2 || name.length > 80 || description.length > 500 || labels.length < 1 || labels.length > 30) return { ok: false, message: "Enter a table name and between 1 and 30 columns." };
  if (labels.some(label => label.length < 1 || label.length > 80) || new Set(labels.map(label => label.toLowerCase())).size !== labels.length) return { ok: false, message: "Column names must be unique and no longer than 80 characters." };
  const allowed = new Set(["text", "number", "date", "checkbox"]);
  if (types.length !== labels.length || types.some(type => !allowed.has(type))) return { ok: false, message: "Choose a valid type for every column." };
  const columns: ClubCustomColumn[] = labels.map((label, index) => ({ key: `column_${index + 1}`, label, type: types[index] as ClubCustomColumn["type"], required: required.has(String(index)) }));
  const row = await current.db.from("club_custom_tables").insert({ club_id: clubId, name, description: description || null, columns, created_by: current.user.id }).select("id").maybeSingle();
  if (row.error || !row.data) return { ok: false, message: row.error?.code === "23505" ? "This Club already has a table with that name." : "Table could not be created. Apply club_custom_tables.sql first." };
  revalidatePath(`/clubs/manage/${clubId}/tables`);
  return { ok: true, message: "Custom table created." };
}

export async function addCustomTableRow(form: FormData) {
  const clubId = String(form.get("club_id") ?? "");
  const tableId = String(form.get("table_id") ?? "");
  const current = await context(clubId);
  if (!current) return denied;
  const table = await current.db.from("club_custom_tables").select("id,columns").eq("id", tableId).eq("club_id", clubId).maybeSingle();
  if (!table.data) return { ok: false, message: "Table was not found." };
  const values: Record<string, string | number | boolean> = {};
  for (const column of table.data.columns) {
    const raw = String(form.get(column.key) ?? "").trim();
    if (column.type === "checkbox") values[column.key] = form.get(column.key) === "on";
    else if (column.type === "number") {
      if (!raw && !column.required) values[column.key] = "";
      else { const value = Number(raw); if (!Number.isFinite(value)) return { ok: false, message: `${column.label} must be a valid number.` }; values[column.key] = value; }
    } else if (column.type === "date") {
      const value = parseOptionalDateOnly(raw); if (value === undefined || (column.required && !value)) return { ok: false, message: `${column.label} must be a valid date.` }; values[column.key] = value ?? "";
    } else values[column.key] = raw;
    if (column.required && column.type !== "checkbox" && values[column.key] === "") return { ok: false, message: `${column.label} is required.` };
    if (typeof values[column.key] === "string" && String(values[column.key]).length > 2000) return { ok: false, message: `${column.label} is too long.` };
  }
  const result = await current.db.from("club_custom_table_rows").insert({ table_id: tableId, data: values, created_by: current.user.id });
  if (result.error) return { ok: false, message: "Row could not be saved." };
  revalidatePath(`/clubs/manage/${clubId}/tables/${tableId}`);
  return { ok: true, message: "Row added." };
}

export async function deleteCustomTableRow(form: FormData) {
  const clubId = String(form.get("club_id") ?? "");
  const tableId = String(form.get("table_id") ?? "");
  const current = await context(clubId);
  if (!current) return denied;
  if (form.get("confirm") !== "yes") return { ok: false, message: "Confirm row deletion first." };
  const table = await current.db.from("club_custom_tables").select("id").eq("id", tableId).eq("club_id", clubId).maybeSingle();
  if (!table.data) return { ok: false, message: "Table was not found." };
  const result = await current.db.from("club_custom_table_rows").delete().eq("id", String(form.get("row_id") ?? "")).eq("table_id", tableId);
  if (result.error) return { ok: false, message: "Row could not be deleted." };
  revalidatePath(`/clubs/manage/${clubId}/tables/${tableId}`);
  return { ok: true, message: "Row deleted." };
}

export async function deleteCustomTable(form: FormData) {
  const clubId = String(form.get("club_id") ?? "");
  const current = await context(clubId);
  if (!current) return denied;
  if (form.get("confirm") !== "delete") return { ok: false, message: "Confirm permanent deletion first." };
  const result = await current.db.from("club_custom_tables").delete().eq("id", String(form.get("table_id") ?? "")).eq("club_id", clubId);
  if (result.error) return { ok: false, message: "Table could not be deleted." };
  revalidatePath(`/clubs/manage/${clubId}/tables`);
  return { ok: true, message: "Table and all of its rows were deleted." };
}
