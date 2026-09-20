import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const siteTextDefaults = {
  site_name: "Bayside Hub",
  home_title: "Anchored in Excellence",
  home_intro: "Discover activities, opportunities, and clubs, all in one place. Browse around to start exploring!",
  home_cta_label: "Explore",
  about_intro: "Bayside Hub is Bayside High School's one-stop platform for activities, clubs, events, and opportunities.",
  about_heading: "Anchored in Excellence",
  about_body: "Bayside Hub is Bayside High School's one-stop platform for activities, clubs, events, and opportunities — built by students, for students. We keep every announcement, meeting, and deadline in one place so you never miss out.",
  about_card_1_title: "Everything in one place",
  about_card_1_body: "Announcements, club listings, calendars, and opportunities — a single source of truth for school life.",
  about_card_2_title: "Built by students",
  about_card_2_body: "Developed and maintained by the Bayside student dev team, guided by advisors and the S.O. office.",
  about_card_3_title: "Open to every Baysider",
  about_card_3_body: "Every Baysider can browse, join clubs, and find opportunities with their NYC school account.",
  support_heading: "We are here to help!",
  support_intro: "Comments, concerns, and issues are welcome.",
  support_response_time: "Average response time: within two school days.",
  support_location: "For in-person help, visit the S.O. office in Room 131.",
  footer_note: "A student-built community platform for Bayside High School.",
  footer_contact: "",
  support_faqs: "Who can I contact about a technical issue? || Submit a Technical Support request below. The support team will respond in the request conversation.\nHow do I track a request? || Open My requests on this page to view its status and replies.",
  manual_content: "STUDENTS\nSign in with your school account, browse Activities & Clubs, join a Club, follow Updates & Calendar, and track requests from Support.\n\nADVISORS & CLUB OFFICERS\nOpen Manage My Clubs to update Club information, meetings, members, announcements, media, attendance, treasury records, and the Constitution.\n\nADMINISTRATORS\nUse Admin to review Club applications, announcements, support requests, accounts, and public content.\n\nNEED HELP?\nSubmit a Support request and continue the conversation from My requests.",
};

export type SiteTextKey = keyof typeof siteTextDefaults;

export const siteContentSections: Array<{
  title: string;
  description: string;
  fields: Array<{ key: SiteTextKey; label: string; help: string; rows?: number; optional?: boolean }>;
}> = [
  { title: "Site identity", description: "Shared naming and footer information.", fields: [
    { key: "site_name", label: "Site name", help: "Displayed in the global footer." },
    { key: "footer_note", label: "Footer description", help: "Short public description shown on every page.", rows: 3 },
    { key: "footer_contact", label: "Public contact", help: "Optional public email, office, or phone information.", rows: 2, optional: true },
  ] },
  { title: "Home page", description: "Main landing-page message and action.", fields: [
    { key: "home_title", label: "Hero title", help: "Primary home-page heading." },
    { key: "home_intro", label: "Introduction", help: "Supporting text beneath the heading.", rows: 4 },
    { key: "home_cta_label", label: "Explore button label", help: "Keep this action short and specific." },
  ] },
  { title: "About page", description: "About-page introduction, story, and value cards.", fields: [
    { key: "about_intro", label: "Page introduction", help: "Shown below the About Us page title.", rows: 3 },
    { key: "about_heading", label: "Story heading", help: "Heading inside the main About card." },
    { key: "about_body", label: "Story", help: "Main public description of Bayside Hub.", rows: 5 },
    { key: "about_card_1_title", label: "Card 1 title", help: "First value-card heading." },
    { key: "about_card_1_body", label: "Card 1 body", help: "First value-card description.", rows: 3 },
    { key: "about_card_2_title", label: "Card 2 title", help: "Second value-card heading." },
    { key: "about_card_2_body", label: "Card 2 body", help: "Second value-card description.", rows: 3 },
    { key: "about_card_3_title", label: "Card 3 title", help: "Third value-card heading." },
    { key: "about_card_3_body", label: "Card 3 body", help: "Third value-card description.", rows: 3 },
  ] },
  { title: "Support", description: "Support landing page, FAQs, and response expectations.", fields: [
    { key: "support_heading", label: "Page heading", help: "Primary heading on the Support page." },
    { key: "support_intro", label: "Introduction", help: "Short message below Support search.", rows: 3 },
    { key: "support_response_time", label: "Response time", help: "Public service-level expectation." },
    { key: "support_location", label: "In-person support", help: "Optional room or office instructions.", rows: 2, optional: true },
    { key: "support_faqs", label: "Frequently asked questions", help: "One per line using Question || Answer.", rows: 8 },
    { key: "manual_content", label: "Help guide", help: "Plain-text guide; blank lines create sections.", rows: 14 },
  ] },
];

/** Render plain text only; keep public pages usable before the migration exists. */
export const getSiteText = cache(async () => {
  if (!isSupabaseConfigured()) return siteTextDefaults;
  const db = await createServerClient();
  const { data, error } = await db.from("site_content").select("key,body");
  if (error) throw new Error(`Unable to load site content: ${error.message}`);
  const result = { ...siteTextDefaults };
  for (const item of data ?? []) {
    if (Object.hasOwn(result, item.key)) result[item.key as keyof typeof result] = item.body;
  }
  return result;
});
