import type { DayKey } from "./day";
import { lastNDays, shiftKey, todayKey } from "./day";

/**
 * Streak engine. Missing a day never kills anything on its own — a single
 * gap is healed by one Pressed Leaf. Two consecutive missed days break it,
 * gently, with no punishment screen anywhere.
 */

export type PressInfo = {
  count: number; // earned, unconsumed
  consumedFor: DayKey[];
};

export type StreakState = {
  current: number;
  longest: number;
  doneToday: boolean;
  /** streak alive but today is not done yet */
  pending: boolean;
  /** yesterday missed and today not done — next days will break it */
  atRisk: boolean;
  /** a Pressed Leaf automatically healed a gap */
  healedBy?: DayKey;
  pressesLeft: number;
};

export function daySetFrom(sessions: { day: DayKey; minutes: number }[]): Set<DayKey> {
  // a day counts when any session logged real time; 0-minute artifacts don't
  return new Set(sessions.filter((s) => s.minutes >= 1).map((s) => s.day));
}

export function computeStreak(
  doneDays: Set<DayKey>,
  presses: PressInfo,
  today: DayKey = todayKey()
): StreakState {
  const doneToday = doneDays.has(today);
  const pressesLeft = presses.count;

  // current streak: walk back from the most recent alive day
  let cursor = doneToday ? today : shiftKey(today, -1);

  let current = 0;
  let healedBy: DayKey | undefined;
  let usedPresses = 0;
  const consumedSet = new Set(presses.consumedFor);

  // walk back up to 400 days
  for (let i = 0; i < 400; i++) {
    if (doneDays.has(cursor)) {
      current++;
      cursor = shiftKey(cursor, -1);
      continue;
    }
    if (consumedSet.has(cursor)) {
      // historically healed — keeps the chain alive, no new press consumed
      healedBy = cursor;
      cursor = shiftKey(cursor, -1);
      continue;
    }
    // fresh gap: heal a single missed day if an unconsumed press is available
    const nextDown = shiftKey(cursor, -1);
    if (pressesLeft - usedPresses > 0 && doneDays.has(nextDown)) {
      usedPresses++;
      healedBy = cursor;
      cursor = shiftKey(cursor, -1);
      continue;
    }
    break;
  }

  current -= usedPresses; // presses extend the chain, they aren't reading days

  // longest raw chain, historical, no presses counted
  const sorted = [...doneDays].sort();
  let longest = 0;
  let run = 0;
  let prev: DayKey | null = null;
  for (const day of sorted) {
    run = prev && shiftKey(prev, 1) === day ? run + 1 : 1;
    prev = day;
    if (run > longest) longest = run;
  }

  const pending = !doneToday && current > 0;
  const atRisk = pending && pressesLeft === 0;

  return {
    current: Math.max(current, 0),
    longest: Math.max(longest, current),
    doneToday,
    pending,
    atRisk,
    healedBy,
    pressesLeft: Math.max(pressesLeft - usedPresses, 0),
  };
}

/** growth stages of the plant: 0 seed → 7 evergreen */
export function stageOf(streak: number): number {
  if (streak <= 0) return 0;
  if (streak === 1) return 1;
  if (streak <= 3) return 2;
  if (streak <= 6) return 3;
  if (streak <= 13) return 4;
  if (streak <= 29) return 5;
  if (streak <= 59) return 6;
  return 7;
}

export const STAGE_NAMES = [
  "Seed",
  "Sprout",
  "Sapling",
  "Stem",
  "Young plant",
  "Bough",
  "Tree",
  "Evergreen",
] as const;

export type GardenDay = {
  day: DayKey;
  state: "leaf" | "pressed" | "empty" | "future";
};

/** last n days ending today; consumed presses appear as pressed leaves */
export function garden(
  doneDays: Set<DayKey>,
  consumedFor: DayKey[],
  today: DayKey,
  n = 35
): GardenDay[] {
  const consumed = new Set(consumedFor);
  return lastNDays(today, n).map((day) => {
    if (doneDays.has(day)) return { day, state: "leaf" as const };
    if (consumed.has(day)) return { day, state: "pressed" as const };
    return { day, state: "empty" as const };
  });
}
