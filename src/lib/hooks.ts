"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db, getProfile, type PressedLeaf, type Profile, type Session } from "./db";
import {
  computeStreak,
  garden,
  type GardenDay,
  type StreakState,
} from "./streak";
import { lastNDays, type DayKey } from "./day";
import { useToday } from "./useToday";

export type PressInfoLite = { count: number; consumedFor: DayKey[] };

const EMPTY_SESSIONS: Session[] = [];
const EMPTY_PRESSED: PressedLeaf[] = [];

export type GardenData = {
  profile: Profile | undefined;
  streak: StreakState | undefined;
  sessions: Session[];
  weekMinutes: number;
  todayMinutes: number;
  days: GardenDay[] | undefined;
  presses: PressInfoLite;
  /** null until mounted — wall-clock reads never run during prerender */
  today: DayKey | null;
};

/**
 * One live query per screen — Dexie's liveQuery re-runs on every write, so
 * the streak number updates the instant a session lands (no spinners).
 */
export function useGardenData(n = 35): GardenData {
  const today = useToday();

  const profile = useLiveQuery(() => getProfile(), []);
  const sessions =
    useLiveQuery(() => db.sessions.reverse().sortBy("at"), [], EMPTY_SESSIONS) ??
    EMPTY_SESSIONS;
  const pressed = useLiveQuery(() => db.pressed.toArray(), [], EMPTY_PRESSED) ?? EMPTY_PRESSED;

  const doneDays = useMemo(
    () => new Set(sessions.filter((s) => s.minutes >= 1).map((s) => s.day)),
    [sessions]
  );
  const consumedFor = useMemo(
    () =>
      pressed
        .filter((p) => p.usedForDay)
        .map((p) => p.usedForDay as DayKey),
    [pressed]
  );
  const count = useMemo(
    () => pressed.filter((p) => !p.usedForDay).length,
    [pressed]
  );

  const streak =
    today === null ? undefined : computeStreak(doneDays, { count, consumedFor }, today);

  const weekMinutes = useMemo(() => {
    if (today === null) return 0;
    const last7 = new Set(lastNDays(today, 7));
    return sessions
      .filter((s) => last7.has(s.day))
      .reduce((sum, s) => sum + s.minutes, 0);
  }, [today, sessions]);

  const todayMinutes = useMemo(
    () =>
      today === null
        ? 0
        : sessions.filter((s) => s.day === today).reduce((sum, s) => sum + s.minutes, 0),
    [today, sessions]
  );

  const days = useLiveQuery(
    () =>
      today === null
        ? Promise.resolve(undefined)
        : Promise.resolve(garden(doneDays, consumedFor, today, n)),
    [today, doneDays.size, consumedFor.length, n]
  );

  return {
    profile,
    streak,
    sessions,
    weekMinutes,
    todayMinutes,
    days,
    presses: { count, consumedFor },
    today,
  };
}
