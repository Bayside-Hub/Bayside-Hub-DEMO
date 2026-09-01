import assert from "node:assert/strict";
import test from "node:test";
import { normalizeRecordId, preferLiveData } from "./live-data.ts";

test("preferLiveData does not mix production and fallback records", () => {
  assert.deepEqual(preferLiveData(["live"], ["fallback"]), ["live"]);
  assert.deepEqual(preferLiveData([], ["fallback"]), ["fallback"]);
});

test("normalizeRecordId supports legacy numeric and canonical string IDs", () => {
  assert.equal(normalizeRecordId(42), "42");
  assert.equal(normalizeRecordId("76c3a57b"), "76c3a57b");
});
