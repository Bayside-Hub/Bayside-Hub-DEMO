import assert from "node:assert/strict";
import test from "node:test";
import { attendanceDurationLabel, isTemporaryAttendanceDuration } from "./attendance-session.ts";

test("quick attendance accepts short controlled windows", () => {
  for (const minutes of [1, 3, 5, 10, 15, 30, 60, 120, 240]) assert.equal(isTemporaryAttendanceDuration(minutes), true);
  for (const minutes of [0, 2, 241, Number.NaN]) assert.equal(isTemporaryAttendanceDuration(minutes), false);
});

test("attendance duration labels remain readable", () => {
  assert.equal(attendanceDurationLabel(1), "1 minute");
  assert.equal(attendanceDurationLabel(60), "1 hour");
  assert.equal(attendanceDurationLabel(120), "2 hours");
});
