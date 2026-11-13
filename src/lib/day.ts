/**
 * Day logic. The streak boundary is the USER's local day, never UTC —
 * a reader in Fiji and one in Hawaii must both get their midnight.
 */

export type DayKey = string; // "YYYY-MM-DD" in the user's local zone

const fmtCache = new Map<string, Intl.DateTimeFormat>();

function formatter(tz?: string): Intl.DateTimeFormat {
  const key = tz ?? "local";
  let fmt = fmtCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }); // en-CA yields ISO-like YYYY-MM-DD
    fmtCache.set(key, fmt);
  }
  return fmt;
}

export function todayKey(tz?: string): DayKey {
  return formatter(tz).format(new Date());
}

export function dayKeyOf(date: Date, tz?: string): DayKey {
  return formatter(tz).format(date);
}

function parseKey(key: DayKey): { y: number; m: number; d: number } {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m, d };
}

/** Shift a day key by n days (UTC-anchored date math, label preserved) */
export function shiftKey(key: DayKey, n: number): DayKey {
  const { y, m, d } = parseKey(key);
  const date = new Date(Date.UTC(y, m - 1, d + n));
  return date.toISOString().slice(0, 10);
}

export function monthKey(key: DayKey): string {
  return key.slice(0, 7); // "YYYY-MM"
}

/** ISO week key for weekly sprints, computed from the local day key */
export function isoWeekKey(key: DayKey): string {
  const { y, m, d } = parseKey(key);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = date.getUTCDay() || 7; // Mon=1..Sun=7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum); // Thursday of this ISO week
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Monday of the week containing key */
export function weekStart(key: DayKey): DayKey {
  const { y, m, d } = parseKey(key);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = date.getUTCDay() || 7;
  return shiftKey(key, 1 - dayNum);
}

/** Last n day keys ending at (and including) key, chronological order */
export function lastNDays(key: DayKey, n: number): DayKey[] {
  const out: DayKey[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(shiftKey(key, -i));
  return out;
}

export function friendlyDate(key: DayKey, today: DayKey): string {
  const { y, m, d } = parseKey(key);
  const date = new Date(Date.UTC(y, m - 1, d));
  const weekday = new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(date);
  if (key === today) return "Today";
  if (key === shiftKey(today, -1)) return "Yesterday";
  return `${weekday} ${m}/${d}`;
}
