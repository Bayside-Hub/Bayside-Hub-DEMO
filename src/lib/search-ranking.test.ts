import assert from "node:assert/strict";
import test from "node:test";
import { rankSearchResults } from "./search-ranking.ts";

const results = [
  { kind: "Club" as const, title: "Robotics Club", href: "/clubs/robotics", meta: "STEM" },
  { kind: "Event" as const, title: "Robotics Showcase", href: "/events/showcase", meta: "May 10" },
  { kind: "Club" as const, title: "Art Club", href: "/clubs/art", meta: "Robotics collaboration" },
  { kind: "Club" as const, title: "Robotics Club", href: "/clubs/robotics", meta: "duplicate" },
];

test("ranks title matches ahead of metadata matches and removes duplicates", () => {
  assert.deepEqual(
    rankSearchResults(results, "robotics").map((result) => result.href),
    ["/clubs/robotics", "/events/showcase", "/clubs/art"],
  );
});

test("requires all terms and bounds the result count", () => {
  assert.deepEqual(rankSearchResults(results, "robotics missing"), []);
  assert.equal(rankSearchResults(results, "club", 999).length, 2);
});
