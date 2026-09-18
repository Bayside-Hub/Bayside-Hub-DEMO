import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const siteTextDefaults = {
  home_intro: "Discover activities, opportunities, and clubs, all in one place. Browse around to start exploring!",
  about_intro: "Bayside Hub is Bayside High School's one-stop platform for activities, clubs, events, and opportunities.",
  support_intro: "Comments, concerns, and issues are welcome.",
  footer_note: "A student-built community platform for Bayside High School.",
  support_faqs: "Who can I contact about a technical issue? || Submit a Technical Support request below. The support team will respond in the request conversation.\nHow do I track a request? || Open My requests on this page to view its status and replies.",
  manual_content: "STUDENTS\nSign in with your school account, browse Activities & Clubs, join a Club, follow Updates & Calendar, and track requests from Support.\n\nADVISORS & CLUB OFFICERS\nOpen Manage My Clubs to update Club information, meetings, members, announcements, media, attendance, treasury records, Constitution, and elections.\n\nADMINISTRATORS\nUse Admin to review Club applications, announcements, support requests, accounts, and public content.\n\nNEED HELP?\nSubmit a Support request and continue the conversation from My requests.",
};

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
