import assert from "node:assert/strict";
import test from "node:test";
import { getCurrentBellPeriod } from "./bell-schedule.ts";

test("identifies the current period in New York time", () => {
  assert.equal(getCurrentBellPeriod(new Date("2026-09-17T12:15:00Z"))?.period, 2);
  assert.equal(getCurrentBellPeriod(new Date("2026-09-17T17:20:00Z"))?.period, 8);
});

test("does not highlight passing time, after school, or weekends", () => {
  assert.equal(getCurrentBellPeriod(new Date("2026-09-17T12:48:00Z")), null);
  assert.equal(getCurrentBellPeriod(new Date("2026-09-17T21:00:00Z")), null);
  assert.equal(getCurrentBellPeriod(new Date("2026-09-19T14:00:00Z")), null);
});
