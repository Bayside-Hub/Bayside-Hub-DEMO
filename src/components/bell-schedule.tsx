import Link from "next/link";

const periods = [
  { period: 1, start: "7:10 AM", end: "7:57 AM", length: 47, bathroom: "7:20–7:45 AM" },
  { period: 2, start: "8:00 AM", end: "8:47 AM", length: 47, bathroom: "8:10–8:35 AM" },
  { period: 3, start: "8:50 AM", end: "9:39 AM", length: 49, bathroom: "9:00–9:30 AM" },
  { period: 4, start: "9:42 AM", end: "10:29 AM", length: 47, bathroom: "9:52–10:20 AM" },
  { period: 5, start: "10:32 AM", end: "11:19 AM", length: 47, bathroom: "10:42–11:10 AM" },
  { period: 6, start: "11:22 AM", end: "12:09 PM", length: 47, bathroom: "11:32 AM–12:00 PM" },
  { period: 7, start: "12:12 PM", end: "12:59 PM", length: 47, bathroom: "12:22–12:50 PM" },
  { period: 8, start: "1:02 PM", end: "1:51 PM", length: 49, bathroom: "1:12–1:40 PM" },
  { period: 9, start: "1:54 PM", end: "2:41 PM", length: 47, bathroom: "2:05–2:30 PM" },
  { period: 10, start: "2:44 PM", end: "3:31 PM", length: 47, bathroom: "2:55–3:20 PM" },
  { period: 11, start: "3:34 PM", end: "4:21 PM", length: 47, bathroom: "3:45–4:10 PM" },
];

export default function BellSchedule() {
  return (
    <section id="bell-schedule" className="scroll-mt-28 overflow-hidden rounded-[18px] border border-line bg-card shadow-sm" aria-labelledby="bell-schedule-title">
      <header className="flex flex-col gap-3 border-b border-line px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-powder">School day</p>
          <h2 id="bell-schedule-title" className="mt-1 text-2xl font-bold text-ink">2026–2027 Bell Schedule</h2>
          <p className="mt-1 text-sm text-muted">Student schedule and bathroom access times.</p>
        </div>
        <Link href="https://www.baysidehighschool.org/apps/bell_schedules/index.jsp?id=9999" target="_blank" rel="noreferrer" className="shrink-0 text-sm font-bold text-navy">Official schedule ↗</Link>
      </header>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-content-bg text-xs uppercase tracking-[0.12em] text-muted">
            <tr><th className="px-6 py-3">Period</th><th className="px-4 py-3">Start</th><th className="px-4 py-3">End</th><th className="px-4 py-3">Length</th><th className="px-6 py-3">Bathroom access</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {periods.map((item) => <tr key={item.period} className="text-ink transition-colors hover:bg-content-bg/70"><th scope="row" className="px-6 py-3 font-bold">Period {item.period}</th><td className="whitespace-nowrap px-4 py-3">{item.start}</td><td className="whitespace-nowrap px-4 py-3">{item.end}</td><td className="whitespace-nowrap px-4 py-3 text-muted">{item.length} min</td><td className="whitespace-nowrap px-6 py-3 text-muted">{item.bathroom}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-line sm:hidden">
        {periods.map((item) => <article key={item.period} className="px-5 py-4"><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-ink">Period {item.period}</h3><p className="font-semibold text-ink">{item.start}–{item.end}</p></div><div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted"><span>{item.length} minutes</span><span>Bathrooms {item.bathroom}</span></div></article>)}
      </div>
    </section>
  );
}
