import assert from "node:assert/strict";
import test from "node:test";
import { parseStudentDashboard } from "./student-dashboard-data.ts";

test("dashboard payload keeps scoped management access", () => {
  assert.deepEqual(parseStudentDashboard({
    active_clubs: [{ id: "club-1", slug: "robotics", name: "Robotics" }],
    pending_memberships: 2,
    pending_applications: 1,
    open_support_requests: 3,
    managed_club_count: 1,
  }), {
    activeClubs: [{ id: "club-1", slug: "robotics", name: "Robotics" }],
    pendingMemberships: 2,
    pendingApplications: 1,
    openSupportRequests: 3,
    managedClubCount: 1,
  });
});

test("dashboard payload rejects invalid roots and sanitizes malformed fields", () => {
  assert.equal(parseStudentDashboard(null), null);
  assert.deepEqual(parseStudentDashboard({ active_clubs: [{ id: 1 }], pending_memberships: -4 }), {
    activeClubs: [],
    pendingMemberships: 0,
    pendingApplications: 0,
    openSupportRequests: 0,
    managedClubCount: 0,
  });
});
