"use client";

import { useEffect, useState } from "react";

/** Keeps the clock and date accurate after the server-rendered page has loaded. */
export default function LiveDateTile() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const time = now
    ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(now)
    : "—:—";
  const month = now
    ? new Intl.DateTimeFormat("en-US", { month: "short" }).format(now).toUpperCase()
    : "TODAY";

  return (
    <aside className="flex min-h-[420px] flex-col rounded-[22px] bg-[#f0e7d7] p-2 text-black" aria-label="Current date and time">
      <p className="px-4 pt-3 text-6xl font-bold tabular-nums sm:text-7xl" aria-live="polite">{time}</p>
      <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-[18px] border-4 border-black bg-[#95a1b1] p-8">
        <span className="text-7xl font-bold sm:text-8xl">{month}</span>
        <span className="text-8xl font-bold tabular-nums sm:text-9xl">{now?.getDate() ?? "—"}</span>
      </div>
    </aside>
  );
}
