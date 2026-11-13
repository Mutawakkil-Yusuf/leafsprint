"use client";

import Link from "next/link";
import { useState } from "react";
import { CATALOG } from "@/lib/catalog";
import { db, DEFAULT_PROFILE } from "@/lib/db";
import { leafPop, pageTurn, unlockAudio } from "@/lib/sounds";
import { Plant } from "./Plant";
import { BookCover } from "./BookObject";
import { IconLeaf } from "./icons";

/**
 * Onboarding: three quiet steps, one action each, no signup wall.
 * The reader is reading by screen four — or closes the app trying.
 */

const FEATURED = ["1342", "84", "11", "1952", "345"]
  .map((id) => CATALOG.find((b) => b.id === id))
  .filter(Boolean) as typeof CATALOG;

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [reminder, setReminder] = useState("20:30");
  const [picked, setPicked] = useState<string | null>(null);
  const [planted, setPlanted] = useState(false);

  const next = async () => {
    unlockAudio();
    leafPop();
    setStep((s) => s + 1);
  };

  const finish = () => {
    unlockAudio();
    leafPop();
    setPlanted(true);
    if (picked) {
      void db.shelf.put({ bookId: picked, status: "reading", startedAt: Date.now() });
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-paper">
      {step === 0 && (
        <Screen>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Plant stage={0} watered={false} className="h-[200px] w-auto" />
            <h1 className="mt-4 max-w-[16ch] font-display text-[34px] leading-[1.15]">
              Read daily. Keep the leaf alive.
            </h1>
            <p className="mt-3 max-w-[34ch] text-[15px] text-muted">
              Leafsprint turns a few pages a day into a plant that only grows
              if you keep reading.
            </p>
          </div>
          <Actions>
            <button
              onClick={next}
              className="w-full rounded-full bg-leaf py-4 text-[16px] font-semibold text-paper transition-colors hover:bg-leaf-soft"
            >
              Plant the seed
            </button>
            <p className="text-center text-[12px] text-muted">
              Open source, AGPL-3.0 · no account needed to start
            </p>
          </Actions>
        </Screen>
      )}

      {step === 1 && (
        <Screen>
          <div className="flex flex-1 flex-col justify-center">
            <h2 className="font-display text-[28px] leading-tight">
              What should the plant call you?
            </h2>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void next()}
              placeholder="Reader"
              maxLength={30}
              className="mt-5 w-full rounded-2xl border border-line bg-card px-4 py-3.5 font-display text-[19px] outline-none focus:border-leaf"
            />
            <p className="mt-2 text-[13px] text-muted">A name, nothing more. No email, no wall.</p>
          </div>
          <Actions>
            <button onClick={() => void next()} className="w-full rounded-full bg-leaf py-4 text-[16px] font-semibold text-paper transition-colors hover:bg-leaf-soft">
              Continue
            </button>
          </Actions>
        </Screen>
      )}

      {step === 2 && (
        <Screen>
          <div className="flex flex-1 flex-col justify-center">
            <h2 className="font-display text-[28px] leading-tight">
              When does reading usually fit?
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              We&apos;ll ask the plant to tap your shoulder then. Change it anytime.
            </p>
            <input
              type="time"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="mt-5 w-full rounded-2xl border border-line bg-card px-4 py-3.5 font-display text-[22px] outline-none focus:border-leaf"
            />
          </div>
          <Actions>
            <button onClick={() => void next()} className="w-full rounded-full bg-leaf py-4 text-[16px] font-semibold text-paper transition-colors hover:bg-leaf-soft">
              That&apos;s the hour
            </button>
          </Actions>
        </Screen>
      )}

      {step === 3 && !planted && (
        <Screen>
          <div className="flex flex-1 flex-col justify-center">
            <h2 className="font-display text-[28px] leading-tight">Pick your first leaf</h2>
            <p className="mt-2 text-[15px] text-muted">
              All public domain, all offline once opened. You can switch anytime.
            </p>
            <div className="mt-5 grid grid-cols-5 gap-2.5">
              {FEATURED.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    unlockAudio();
                    pageTurn();
                    setPicked(b.id);
                  }}
                  aria-label={b.title}
                  aria-pressed={picked === b.id}
                  className={`relative rounded-md transition-transform duration-200 ${
                    picked === b.id
                      ? "scale-105 ring-2 ring-leaf ring-offset-2 ring-offset-paper"
                      : "hover:-translate-y-1"
                  } motion-reduce:transition-none`}
                >
                  <BookCover book={b} size="xs" className="aspect-[2/3] w-full" />
                </button>
              ))}
            </div>
          </div>
          <Actions>
            <button
              onClick={() => void finish()}
              disabled={!picked}
              className="w-full rounded-full bg-leaf py-4 text-[16px] font-semibold text-paper transition-colors hover:bg-leaf-soft disabled:opacity-50"
            >
              {picked ? "Start reading" : "Pick one to continue"}
            </button>
          </Actions>
        </Screen>
      )}

      {planted && (
        <Screen>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Plant stage={1} watered className="leaf-in h-[220px] w-auto" />
            <h2 className="mt-4 font-display text-[28px] leading-tight">
              It&apos;s alive. Barely — like all first drafts.
            </h2>
            <p className="mt-3 max-w-[34ch] text-[15px] text-muted">
              Two pages today and it doubles in confidence.
            </p>
          </div>
          <Actions>
            <Link
            href="/"
            onClick={() => {
              db.profile.get("me").then((p) => {
                void db.profile.put({ ...(p ?? DEFAULT_PROFILE), name: name.trim() || "Reader", reminderAt: reminder, onboarded: true });
              });
              if (picked) {
                void db.shelf.put({ bookId: picked, status: "reading", startedAt: Date.now() });
              }
              unlockAudio();
              pageTurn();
            }}
            className="w-full rounded-full bg-leaf py-4 text-center text-[16px] font-semibold text-paper transition-colors hover:bg-leaf-soft"
          >
            Enter Leafsprint
          </Link>
          </Actions>
        </Screen>
      )}
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="rise-in mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 safe-t safe-b">
      {children}
    </div>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 pb-8">{children}</div>;
}

export function OnboardingIcon() {
  return <IconLeaf className="h-4 w-4" />;
}
