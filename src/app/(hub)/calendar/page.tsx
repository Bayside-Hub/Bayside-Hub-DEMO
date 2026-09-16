import { permanentRedirect } from "next/navigation";

export default function CalendarPage() {
  permanentRedirect("/announcements#calendar");
}
