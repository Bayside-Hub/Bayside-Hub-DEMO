"use client";

import { useActionState, useState } from "react";
import { updateUserRole } from "../actions";
import type { Role } from "@/lib/supabase/types";

const roles: Role[] = ["student", "teacher", "advisor", "staff", "admin"];

export default function UserRoleForm({ id, role, clubs }: { id: string; role: Role; clubs: { id: string; name: string }[] }) {
  const [selectedRole, setSelectedRole] = useState(role);
  const [state, action, pending] = useActionState(updateUserRole, null);
  return (
    <form action={action} className="flex flex-wrap items-center justify-end gap-2">
      <input type="hidden" name="id" value={id} />
      <select name="role" value={selectedRole} onChange={event => setSelectedRole(event.target.value as Role)} aria-label="User role" className="rounded-full border border-black/10 bg-content-bg px-3 py-1.5 text-xs font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy">
        {roles.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
      {selectedRole === "advisor" && <label className="grid gap-1 text-xs">Assign advisor to club<select name="club_id" required defaultValue="" className="min-h-10 max-w-60 rounded-lg border border-black/20 px-3"><option value="" disabled>Choose a club</option>{clubs.map(club => <option value={club.id} key={club.id}>{club.name}</option>)}</select></label>}
      {role === "advisor" && selectedRole !== "advisor" && <p className="basis-full text-xs text-orange">Saving removes all advisor assignments for this account. Other independently assigned permissions remain.</p>}
      <button type="submit" disabled={pending} className="rounded-full bg-navy px-3.5 py-1.5 text-xs font-semibold text-cream hover:bg-navy-dark disabled:opacity-50">
        {pending ? "Saving…" : "Save"}
      </button>
      {state && <span className={`basis-full text-right text-xs ${state.ok ? "text-navy" : "text-orange"}`} role={state.ok ? "status" : "alert"}>{state.message}</span>}
    </form>
  );
}
