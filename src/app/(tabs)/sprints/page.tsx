"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, ensureProfile, getProfile } from "@/lib/db";
import { useGardenData } from "@/lib/hooks";
import { isoWeekKey } from "@/lib/day";
import { leafPop, unlockAudio } from "@/lib/sounds";
import { useToday } from "@/lib/useToday";

/**
 * Weekly groves, Duolingo-style but honest:
 * — opt-in (autonomy), small (~15), reset every Monday
 * — ranked by VERIFIED in-app minutes only; manual logs never race here
 * — top 3 promote, bottom 3 demote
 *
 * Until accounts exist, the grove is seeded with demo readers so the
 * mechanics are fully playable. The real grove comes with Supabase auth.
 */

const DEMO_NAMES = [
  "Marta", "Jide", "Anouk", "Ravi", "Sena", "Tomás", "Yuki", "Bilha",
  "Oren", "Farida", "Milo", "Kaia", "Dev", "Ines",
];

const TIERS = [
  "Sprout", "Sapling", "Bough", "Canopy", "Grove", "Forest", "Evergreen",
];

type SessionLite = { verified: boolean; minutes: number };
const EMPTY_SESSIONS: SessionLite[] = [];

// deterministic per-week demo minutes so the grove is stable across reloads
function seededMinutes(week: string, index: number): number {
  let h = 2166136261;
  const s = `${week}:${index}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 18 + ((h >>> 0) % 340); // 18–357 minutes
}

export default function SprintsPage() {
  const { streak } = useGardenData();
  const profile = useLiveQuery(() => getProfile(), []);
  const sessions = useLiveQuery(() => db.sessions.toArray(), [], EMPTY_SESSIONS) ?? EMPTY_SESSIONS;
  const [joining, setJoining] = useState(false);
  const today = useToday();

  const week = today ? isoWeekKey(today) : "";
  const tier = TIERS[Math.min(TIERS.length - 1, Math.floor((streak?.longest ?? 0) / 14))];

  const verifiedMinutes = useMemo(
    () =>
      sessions
        .filter((s) => s.verified && s.minutes >= 1)
        .reduce((sum, s) => sum + s.minutes, 0),
    [sessions]
  );

  const optedIn = profile?.sprintOptIn ?? false;

  const grove = useMemo(() => {
    if (!optedIn) return [];
    const rows = DEMO_NAMES.map((name, i) => ({
      name,
      minutes: seededMinutes(week, i),
      you: false,
    }));
    rows.push({ name: "You", minutes: verifiedMinutes, you: true });
    return rows.sort((a, b) => b.minutes - a.minutes);
  }, [optedIn, verifiedMinutes, week]);

  const yourRank = grove.findIndex((r) => r.you) + 1;

  const join = async () => {
    unlockAudio();
    setJoining(true);
    const profile = await ensureProfile();
    await db.profile.put({ ...profile, sprintOptIn: true });
    leafPop();
    setJoining(false);
  };

  const leave = async () => {
    const profile = await ensureProfile();
    await db.profile.put({ ...profile, sprintOptIn: false });
  };

  return (
    <div className="mx-auto max-w-xl">
      <header className="rise-in">
        <h1 className="font-display text-[26px] leading-tight">Sprints</h1>
        <p className="mt-1 text-sm text-muted">
          Weekly groves of about fifteen readers. Three rise, a few rest.
        </p>
      </header>

      <section className="rise-in mt-5 rounded-3xl border border-line bg-card p-5" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-[19px]">Grove of {tier}</p>
            <p className="mt-0.5 text-[13px] text-muted">
              {optedIn ? "In — resets Monday" : "Not this week"} · {week}
            </p>
          </div>
          {optedIn ? (
            <button
              onClick={leave}
              className="rounded-full border border-line px-4 py-2 text-[13px] text-muted transition-colors hover:text-ink"
            >
              Rest this week
            </button>
          ) : (
            <button
              onClick={join}
              disabled={joining}
              className="rounded-full bg-leaf px-5 py-2.5 text-[15px] font-semibold text-paper transition-colors hover:bg-leaf-soft disabled:opacity-60"
            >
              {joining ? "Planting…" : "Join the grove"}
            </button>
          )}
        </div>
      </section>

      {optedIn && (
        <section className="rise-in mt-4" style={{ animationDelay: "120ms" }}>
          <ol className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-card">
            {grove.map((row, i) => {
              const rank = i + 1;
              const promotes = rank <= 3;
              const demotes = rank > grove.length - 3;
              return (
                <li
                  key={row.name}
                  className={`flex items-center gap-3 px-5 py-3 ${
                    row.you ? "bg-moss/50" : ""
                  }`}
                >
                  <span
                    className={`w-7 font-display text-[15px] ${
                      promotes ? "text-leaf" : demotes ? "text-muted/60" : "text-muted"
                    }`}
                  >
                    {rank}
                  </span>
                  <span className="flex-1 text-[15px]">
                    {row.name}
                    {row.you && <span className="ml-2 text-[12px] text-leaf">you</span>}
                  </span>
                  <span className="text-[13px] tabular-nums text-muted">{row.minutes} min</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-3 flex justify-between px-2 text-[12px] text-muted">
            <span>top 3 rise at midnight Sunday</span>
            <span>bottom 3 rest</span>
          </div>
          {yourRank > 0 && yourRank <= 3 && (
            <p className="mt-2 text-center text-[13px] text-leaf">
              In the rising three — keep the pages turning
            </p>
          )}
        </section>
      )}

      <section className="rise-in mt-6 rounded-2xl border border-dashed border-line p-4" style={{ animationDelay: "180ms" }}>
        <p className="text-[13px] leading-relaxed text-muted">
          Groves rank <span className="text-ink">verified in-app minutes</span> —
          the reader counts only real, active time. Pages you log from paper
          books count for your streak, never for grove rank, so honest readers
          are never raced against estimates.
        </p>
      </section>
    </div>
  );
}

