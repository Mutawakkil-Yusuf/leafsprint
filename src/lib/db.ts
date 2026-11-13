import Dexie, { type Table } from "dexie";
import { todayKey, monthKey, type DayKey } from "./day";

/**
 * Local-first store. Everything lives in IndexedDB so the app works fully
 * offline; when Supabase keys are added, sync layers can sit behind these
 * same functions (see supabase/schema.sql for the matching cloud schema).
 */

export type Profile = {
  id: "me";
  name: string;
  createdAt: number;
  soundOn: boolean;
  sprintOptIn: boolean;
  /** runtime theme: light | night | system */
  theme: "light" | "night" | "system";
  reminderAt: string | null; // "20:30"
  /** completed the welcome flow */
  onboarded?: boolean;
};

export type Session = {
  id?: number;
  /** user-local day key the session counts toward */
  day: DayKey;
  bookId: string;
  minutes: number;
  pages: number;
  source: "read" | "log";
  /** in-app sessions verified via interaction heartbeats */
  verified: boolean;
  at: number;
};

export type Position = {
  bookId: string;
  pct: number;
  /** EPUB CFI for exact restore */
  cfi?: string;
  at: number;
};

export type ShelfEntry = {
  bookId: string;
  status: "reading" | "finished";
  startedAt: number;
  finishedAt?: number;
};

export type PressedLeaf = {
  id?: number;
  month: string; // "YYYY-MM"
  grantedAt: number;
  /** consumed to protect a streak day */
  usedForDay?: DayKey;
};

class LeafsprintDB extends Dexie {
  profile!: Table<Profile, string>;
  sessions!: Table<Session, number>;
  positions!: Table<Position, string>;
  shelf!: Table<ShelfEntry, string>;
  pressed!: Table<PressedLeaf, number>;

  constructor() {
    super("leafsprint");
    this.version(1).stores({
      profile: "id",
      sessions: "++id, day, bookId, [bookId+day]",
      positions: "bookId",
      shelf: "bookId",
      pressed: "++id, month",
    });
  }
}

export const db = new LeafsprintDB();

export const DEFAULT_PROFILE: Profile = {
  id: "me",
  name: "Reader",
  createdAt: Date.now(),
  soundOn: true,
  sprintOptIn: false,
  theme: "system",
  reminderAt: null,
};

export async function getProfile(): Promise<Profile | undefined> {
  return db.profile.get("me");
}

export async function ensureProfile(): Promise<Profile> {
  const existing = await db.profile.get("me");
  if (existing) return existing;
  await db.profile.put(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}

export async function saveSession(input: {
  bookId: string;
  minutes: number;
  pages: number;
  source: "read" | "log";
  verified: boolean;
  at?: number;
  tz?: string;
}): Promise<{ grantedLeaf: boolean; month: string }> {
  const at = input.at ?? Date.now();
  const day = todayKey(input.tz);
  const month = monthKey(day);

  // one earned Pressed Leaf per calendar month, on your first session
  const alreadyGranted = await db.pressed.where("month").equals(month).count();
  let grantedLeaf = false;
  if (alreadyGranted === 0) {
    await db.pressed.add({ month, grantedAt: at });
    grantedLeaf = true;
  }

  await db.sessions.add({
    day,
    bookId: input.bookId,
    minutes: input.minutes,
    pages: input.pages,
    source: input.source,
    verified: input.verified,
    at,
  });

  // shelf bookkeeping
  const entry = await db.shelf.get(input.bookId);
  if (!entry) {
    await db.shelf.put({ bookId: input.bookId, status: "reading", startedAt: at });
  }

  return { grantedLeaf, month };
}

export async function markFinished(bookId: string) {
  const entry = await db.shelf.get(bookId);
  if (entry && entry.status !== "finished") {
    await db.shelf.put({ ...entry, status: "finished", finishedAt: Date.now() });
  }
}
