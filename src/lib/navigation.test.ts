import assert from "node:assert/strict";
import test from "node:test";
import { safeNextPath } from "./navigation.ts";

test("safeNextPath accepts local application paths", () => {
  assert.equal(safeNextPath("/clubs?category=STEM"), "/clubs?category=STEM");
  assert.equal(safeNextPath("/announcements#latest"), "/announcements#latest");
});

test("safeNextPath rejects external and malformed destinations", () => {
  assert.equal(safeNextPath("https://example.com"), "/");
  assert.equal(safeNextPath("//example.com"), "/");
  assert.equal(safeNextPath("/\\example.com"), "/");
  assert.equal(safeNextPath(null, "/login"), "/login");
});
