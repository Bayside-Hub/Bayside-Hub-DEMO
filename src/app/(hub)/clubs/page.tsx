import type { Metadata } from "next";
import { getAllClubs } from "@/lib/clubs";
import ClubBrowser from "./club-browser";

export const metadata: Metadata = {
  title: "Activities & Clubs",
};

export default async function ClubsPage() {
  const clubs = await getAllClubs();
  return <ClubBrowser clubs={clubs} />;
}
