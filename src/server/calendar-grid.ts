/** Jours du mois UTC + cases vides avant le 1er (semaine lundi=0). */
export function utcMonthCells(year: number, month: number): (
  | { kind: "empty" }
  | { kind: "day"; iso: string; dom: number }
)[] {
  const dim = daysInUtcMonth(year, month);
  const firstDow = utcWeekdayMondayZero(year, month); // lun=0 … dim=6
  const cells: ({ kind: "empty" } | { kind: "day"; iso: string; dom: number })[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ kind: "empty" });
  for (let d = 1; d <= dim; d++) {
    const iso = `${year}-${pad2(month)}-${pad2(d)}`;
    cells.push({ kind: "day", iso, dom: d });
  }
  while (cells.length % 7 !== 0) cells.push({ kind: "empty" });
  return cells;
}

export function utcWeekdayMondayZero(year: number, month: number) {
  const dow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // Sun=0
  return (dow + 6) % 7;
}

export function daysInUtcMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function parseYearMonthYm(raw?: string): { ok: boolean; year: number; month: number } {
  const m = raw?.trim() ?? "";
  const match = /^(\d{4})-(\d{2})$/.exec(m);
  if (!match) return { ok: false, year: 0, month: 0 };
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return { ok: false, year: 0, month: 0 };
  return { ok: true, year, month };
}

export function formatYm(year: number, month: number) {
  return `${year}-${pad2(month)}`;
}

export function shiftYmMonths(year: number, month: number, deltaMonths: number) {
  let m = month + deltaMonths;
  let y = year;
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  return { year: y, month: m };
}

export function ymFromParisToday(nowMs: number = Date.now()) {
  const ymd = calendarDateParis(nowMs);
  const [y, m] = ymd.split("-").map(Number);
  return { year: y, month: m, ym: formatYm(y, m) };
}

/** YYYY-MM-DD en Europe/Paris */
export function calendarDateParis(nowMs: number) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .format(new Date(nowMs))
    .slice(0, 10);
}

export function utcRangeForYm(year: number, month: number) {
  const start = `${year}-${pad2(month)}-01`;
  const dim = daysInUtcMonth(year, month);
  const end = `${year}-${pad2(month)}-${pad2(dim)}`;
  return { start, end };
}
