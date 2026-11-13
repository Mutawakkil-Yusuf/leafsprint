"use client";

import { useGardenData } from "@/lib/hooks";
import { STAGE_NAMES, stageOf } from "@/lib/streak";
import { friendlyDate } from "@/lib/day";
import { IconPressedLeaf } from "@/components/icons";

/** A single leaf, by state */
function Leaf({ state, label }: { state: string; label: string }) {
  const filled = state === "leaf";
  const pressed = state === "pressed";
  return (
    <span
      title={label}
      className="relative flex h-9 w-9 items-center justify-center"
      aria-label={label}
    >
      {filled ? (
        <svg viewBox="0 0 36 36" className="h-8 w-8">
          <path
            d="M30 6C14 6 6 16 6 30c10 1 18-4 22-10 1.4-2 2-5 2-8z"
            fill="var(--leaf)"
            transform="rotate(8 18 18)"
          />
          <path d="M8 28C13 20 20 13 27 9" stroke="var(--paper)" strokeWidth="1.4" fill="none" opacity="0.5" />
        </svg>
      ) : pressed ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-honey/15">
          <IconPressedLeaf className="h-5 w-5 text-honey" />
        </span>
      ) : (
        <svg viewBox="0 0 36 36" className="h-8 w-8 opacity-35">
          <path
            d="M30 6C14 6 6 16 6 30c10 1 18-4 22-10 1.4-2 2-5 2-8z"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="1.2"
            strokeDasharray="2 3"
            transform="rotate(8 18 18)"
          />
        </svg>
      )}
    </span>
  );
}

export default function GardenPage() {
  const { days, streak, presses, today, profile } = useGardenData(35);
  const stage = stageOf(streak?.current ?? 0);

  return (
    <div className="mx-auto max-w-xl">
      <header className="rise-in">
        <h1 className="font-display text-[26px] leading-tight">Garden</h1>
        <p className="mt-1 text-sm text-muted">
          The last five weeks, leaf by leaf.
        </p>
      </header>

      {/* the branch runs behind the grid */}
      <section className="rise-in relative mt-6" style={{ animationDelay: "60ms" }}>
        <svg
          aria-hidden="true"
          viewBox="0 0 320 40"
          className="absolute -top-1 left-0 h-10 w-full text-line"
          preserveAspectRatio="none"
        >
          <path
            d="M0 30 C 80 18, 160 34, 240 22 S 320 26, 320 26"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {days && today ? (
          <div className="mt-4 grid grid-cols-7 gap-x-1 gap-y-3">
            {days.map((d) => (
              <div key={d.day} className="flex justify-center">
                <Leaf
                  state={d.state}
                  label={`${friendlyDate(d.day, today)} — ${d.state === "leaf" ? "watered" : d.state === "pressed" ? "pressed leaf saved the day" : "quiet"}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-7 gap-y-3">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="flex justify-center">
                <div className="h-8 w-8 rounded-full bg-moss/50" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rise-in mt-8 grid grid-cols-3 gap-3 text-center" style={{ animationDelay: "120ms" }}>
        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="font-display text-[28px] leading-none">{streak?.current ?? 0}</p>
          <p className="mt-1 text-[12px] text-muted">current sprint</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="font-display text-[28px] leading-none">{streak?.longest ?? 0}</p>
          <p className="mt-1 text-[12px] text-muted">longest sprint</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="font-display text-[28px] leading-none">{presses.count}</p>
          <p className="mt-1 text-[12px] text-muted">pressed leaves</p>
        </div>
      </section>

      <section className="rise-in mt-6 rounded-3xl border border-line bg-card p-5" style={{ animationDelay: "180ms" }}>
        <p className="font-display text-[17px]">{STAGE_NAMES[stage]}</p>
        <p className="mt-1 text-sm text-muted">
          {stage === 0
            ? "Every evergreen started as a seed. One day, one leaf."
            : stage < 5
              ? "Keep watering — growth is invisible until it isn't."
              : "Deep roots now. This is what a reading life looks like."}
        </p>
        <div className="mt-3 flex items-center gap-1.5">
          {STAGE_NAMES.map((name, i) => (
            <span
              key={name}
              className={`h-1.5 flex-1 rounded-full ${i <= stage ? "bg-leaf" : "bg-line"}`}
              title={name}
            />
          ))}
        </div>
      </section>

      <p className="mt-4 text-center text-[12px] text-muted">
        {profile?.reminderAt
          ? `Your nudge arrives at ${profile.reminderAt}.`
          : "A leaf unfurls for any day with real reading time."}
      </p>
    </div>
  );
}
