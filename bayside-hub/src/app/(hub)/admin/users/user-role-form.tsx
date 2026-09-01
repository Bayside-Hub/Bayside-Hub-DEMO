"use client";

import { useActionState } from "react";
import { updateUserRole } from "../actions";
import type { Role } from "@/lib/supabase/types";

const roles: Role[] = ["student", "advisor", "staff", "admin"];

export default function UserRoleForm({ id, role }: { id: string; role: Role }) {
  const [state, action, pending] = useActionState(updateUserRole, null);
  return (
    <form action={action} className="flex flex-wrap items-center justify-end gap-2">
      <input type="hidden" name="id" value={id} />
      <select name="role" defaultValue={role} aria-label="User role" className="rounded-full border border-black/10 bg-content-bg px-3 py-1.5 text-xs font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy">
        {roles.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
      <button type="submit" disabled={pending} className="rounded-full bg-navy px-3.5 py-1.5 text-xs font-semibold text-cream hover:bg-navy-dark disabled:opacity-50">
        {pending ? "Saving…" : "Save"}
      </button>
      {state && <span className={`basis-full text-right text-xs ${state.ok ? "text-navy" : "text-orange"}`} role={state.ok ? "status" : "alert"}>{state.message}</span>}
    </form>
  );
}
