import assert from "node:assert/strict";
import test from "node:test";
import { rankClubs } from "./club-quiz.ts";
import type { Club } from "./data.ts";

const base: Omit<Club, "slug" | "name" | "category" | "meetingDays" | "communityService" | "stem"> = {
  description: "Test club",
  meetingDate: "Weekly",
  meetingTime: "3 PM",
  location: "Room 1",
  commitment: 2,
  officers: [],
};

test("rankClubs explains and ranks strong matches first", () => {
  const clubs: Club[] = [
    { ...base, slug: "robotics", name: "Robotics", category: "STEM", meetingDays: ["Tue"], communityService: false, stem: true },
    { ...base, slug: "art", name: "Art", category: "Arts & Crafts", meetingDays: ["Fri"], communityService: false, stem: false },
  ];
  const ranked = rankClubs(clubs, {
    interests: ["STEM"],
    days: ["Tue"],
    wantsStem: true,
    wantsService: false,
    maxCommitment: 3,
  });
  assert.equal(ranked[0].club.slug, "robotics");
  assert.ok(ranked[0].reasons.length >= 3);
  assert.ok(ranked[0].score > ranked[1].score);
});
