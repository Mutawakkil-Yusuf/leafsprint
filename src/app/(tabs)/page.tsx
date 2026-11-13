"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getBook, type Book } from "@/lib/catalog";
import { db, saveSession } from "@/lib/db";
import { useGardenData } from "@/lib/hooks";
import { stageOf, STAGE_NAMES } from "@/lib/streak";
import { dayComplete, milestone, isMuted, setMuted, leafPop, unlockAudio } from "@/lib/sounds";
import { useGreeting } from "@/lib/useToday";
import { Plant } from "@/components/Plant";
import { BookCover } from "@/components/BookObject";
import { LeafConfetti } from "@/components/LeafConfetti";
import { LeafDrop } from "@/components/LeafDrop";
import { Onboarding } from "@/components/Onboarding";
import { IconLeaf, IconPressedLeaf, IconSoundOff, IconSoundOn } from "@/components/icons";

type DropState = {
  book: Book;
  streak: number;
  stage: number;
  grew: boolean;
  minutes: number;
  pressedEarned: boolean;
};

type PositionLite = { bookId: string; pct: number; at: number };
type ShelfLite = { bookId: string; status: string; startedAt: number };
const EMPTY_POSITIONS: PositionLite[] = [];
const EMPTY_SHELF: ShelfLite[] = [];

export default function TodayPage() {
  const { profile, streak, weekMinutes, todayMinutes, presses, today } = useGardenData();
  const positions = useLiveQuery(() => db.positions.toArray(), [], EMPTY_POSITIONS) ?? EMPTY_POSITIONS;
  const shelf = useLiveQuery(() => db.shelf.toArray(), [], EMPTY_SHELF) ?? EMPTY_SHELF;
  const [sound, setSound] = useState<boolean | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [drop, setDrop] = useState<DropState | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const hello = useGreeting();

  const doneToday = streak?.doneToday ?? false;
  // current book: newest reading-shelf book, preferring one with a saved position
  const currentBook = useMemo(() => {
    const reading = shelf.filter((e) => e.status === "reading");
    const at = new Map(positions.map((p) => [p.bookId, p.at]));
    const withPos = reading
      .filter((e) => at.has(e.bookId))
      .sort((a, b) => (at.get(b.bookId) ?? 0) - (at.get(a.bookId) ?? 0));
    if (withPos.length) return getBook(withPos[0].bookId);
    if (reading.length) {
      const newest = [...reading].sort((a, b) => b.startedAt - a.startedAt)[0];
      return getBook(newest.bookId);
    }
    const sorted = [...positions].sort((a, b) => b.at - a.at);
    return sorted.length ? getBook(sorted[0].bookId) : undefined;
  }, [positions, shelf]);

  const currentPct = currentBook
    ? positions.find((p) => p.bookId === currentBook.id)?.pct
    : undefined;

  const stage = stageOf(streak?.current ?? 0);
  const soundOn = sound ?? !isMuted();

  // The day just became watered (a session landed in IndexedDB) —
  // celebrate HERE, where the plant is, once per transition.
  const prevDone = useRef<boolean | null>(null);
  const prevPresses = useRef(0);
  useEffect(() => {
    if (streak === undefined || today === null) return;
    const wasDone = prevDone.current;
    prevDone.current = streak.doneToday;

    if (wasDone === false && streak.doneToday) {
      void (async () => {
        // celebrate with the session that tipped the day
        const latest = [...(await db.sessions.toArray())]
          .filter((s) => s.day === today)
          .sort((a, b) => b.at - a.at)[0];
        const pressedEarned = presses.count > prevPresses.current;
        const grew = stageOf(streak.current) > stageOf(streak.current - 1);
        if (grew || pressedEarned) {
          milestone();
        } else {
          dayComplete();
        }
        setConfetti((c) => c + 1);
        setDrop({
          book:
            latest?.source === "log"
              ? PAPER_BOOK_PLACEHOLDER
              : currentBook ?? PAPER_BOOK_PLACEHOLDER,
          streak: streak.current,
          stage: stageOf(streak.current),
          grew,
          minutes: latest?.minutes ?? todayMinutes,
          pressedEarned,
        });
      })();
    }
    prevPresses.current = presses.count;
  }, [streak, presses.count, today, currentBook, todayMinutes]);

  // first-run readers get the welcome flow instead of the app
  if (profile && !profile.onboarded) {
    return <Onboarding />;
  }

  return (
    <div className="mx-auto max-w-xl">
      <LeafConfetti trigger={confetti} />

      <header className="rise-in flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{hello ?? "Hello"}, {profile?.name ?? "Reader"}</p>
          <h1 className="font-display text-[26px] leading-tight">Today</h1>
        </div>
        <button
          aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
          onClick={() => {
            unlockAudio();
            const next = !soundOn;
            setMuted(!next);
            setSound(next);
            if (next) leafPop();
          }}
          className="rounded-full border border-line p-2.5 text-muted transition-colors hover:text-ink"
        >
          {soundOn ? (
            <IconSoundOn className="h-[18px] w-[18px]" />
          ) : (
            <IconSoundOff className="h-[18px] w-[18px]" />
          )}
        </button>
      </header>

      {/* the plant */}
      <section className="rise-in mt-2 flex flex-col items-center" style={{ animationDelay: "60ms" }}>
        <Plant stage={stage} watered={doneToday} className="h-[240px] w-auto drop-shadow-sm" />
        <div className="-mt-2 text-center">
          {streak && streak.current > 0 ? (
            <>
              <p className="font-display text-[54px] leading-none tracking-tight">
                {streak.current}
              </p>
              <p className="text-sm text-muted">day sprint · {STAGE_NAMES[stage]}</p>
            </>
          ) : (
            <>
              <p className="font-display text-[26px] leading-snug">A seed waits</p>
              <p className="mt-1 text-sm text-muted">Read a few pages today and it opens</p>
            </>
          )}
        </div>
        <p aria-live="polite" className="mt-3 min-h-6 text-center text-[15px]">
          {streak?.doneToday ? (
            <span className="text-leaf">Watered — the leaf is fed for today</span>
          ) : streak?.healedBy ? (
            <span className="text-honey">A pressed leaf kept your streak alive — read to regrow it</span>
          ) : streak?.atRisk ? (
            <span className="text-honey">Two quiet days break it — two pages save it</span>
          ) : streak?.pending ? (
            <span className="text-muted">Two pages or five minutes keeps it alive</span>
          ) : (
            <span className="text-muted">Nothing to lose yet — just open the book</span>
          )}
        </p>
      </section>

      {/* current book */}
      <section className="rise-in mt-8" style={{ animationDelay: "120ms" }}>
        {currentBook ? (
          <div className="flex items-center gap-5 rounded-3xl border border-line bg-card p-5">
            <BookCover
              book={currentBook}
              pct={currentPct}
              size="md"
              className="h-[104px] w-[68px] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[17px]">{currentBook.title}</p>
              <p className="text-[13px] text-muted">{currentBook.author}</p>
              <Link
                href={`/read/${currentBook.id}`}
                className="mt-3 inline-block rounded-full bg-leaf px-5 py-2.5 text-[15px] font-semibold text-paper transition-colors hover:bg-leaf-soft"
              >
                Resume
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line p-6 text-center">
            <p className="font-display text-[19px]">Pick your first book</p>
            <p className="max-w-[30ch] text-sm text-muted">
              Eleven classics are on the shelf, free and offline once opened.
            </p>
            <Link
              href="/shelf"
              className="rounded-full bg-leaf px-5 py-2.5 text-[15px] font-semibold text-paper transition-colors hover:bg-leaf-soft"
            >
              Open the shelf
            </Link>
          </div>
        )}
      </section>

      {/* manual log + quiet stats */}
      <section className="rise-in mt-4" style={{ animationDelay: "180ms" }}>
        <div className="flex items-center justify-between rounded-2xl px-2 py-1">
          <div className="flex gap-6 text-sm text-muted">
            <span>
              <span className="text-ink">{todayMinutes}</span> min today
            </span>
            <span>
              <span className="text-ink">{weekMinutes}</span> min this week
            </span>
          </div>
          <button
            onClick={() => {
              unlockAudio();
              setLogOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:text-ink"
          >
            <IconLeaf className="h-4 w-4" />
            Log paper reading
          </button>
        </div>
        {presses.count > 0 && (
          <p className="mt-1 flex items-center gap-1.5 px-2 text-[13px] text-muted">
            <IconPressedLeaf className="h-4 w-4 text-honey" />
            {presses.count} pressed leaf{presses.count === 1 ? "" : "s"} saved for rainy days
          </p>
        )}
      </section>

      <LogDialog
        open={logOpen}
        onClose={() => setLogOpen(false)}
      />

      {drop && (
        <LeafDrop
          open
          onClose={() => setDrop(null)}
          streak={drop.streak}
          stage={drop.stage}
          grew={drop.grew}
          quote={drop.book.quote}
          book={drop.book}
          minutes={drop.minutes}
          pressedEarned={drop.pressedEarned}
        />
      )}
    </div>
  );
}

const PAPER_BOOK_PLACEHOLDER = getBook("11") as Book; // Alice — a friendly generic quote

function LogDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState(10);
  const [pages, setPages] = useState(5);
  const [busy, setBusy] = useState(false);

  if (!open || !PAPER_BOOK_PLACEHOLDER) return null;

  const submit = async () => {
    const name = title.trim() || "Paper book";
    setBusy(true);
    try {
      // the day-watering celebration lives in Today's transition watcher
      await saveSession({
        bookId: `manual:${name.toLowerCase().slice(0, 40)}`,
        minutes: Math.max(1, minutes),
        pages: Math.max(0, pages),
        source: "log",
        verified: false,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/45 p-4 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="drop-card w-full max-w-sm rounded-3xl border border-line bg-card p-6">
        <h2 className="font-display text-[19px]">Log paper reading</h2>
        <p className="mt-1 text-[13px] text-muted">
          Counts for your streak. Sprint groves only race verified in-app minutes.
        </p>
        <label className="mt-4 block text-[13px]">
          Book
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Norwegian Wood"
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[15px] outline-none focus:border-leaf"
          />
        </label>
        <div className="mt-3 flex gap-3">
          <label className="flex-1 text-[13px]">
            Minutes
            <input
              type="number"
              min={1}
              max={600}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[15px] outline-none focus:border-leaf"
            />
          </label>
          <label className="flex-1 text-[13px]">
            Pages
            <input
              type="number"
              min={0}
              max={2000}
              value={pages}
              onChange={(e) => setPages(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[15px] outline-none focus:border-leaf"
            />
          </label>
        </div>
        <div className="mt-5 flex gap-2.5">
          <button
            onClick={submit}
            disabled={busy}
            className="flex-1 rounded-full bg-leaf px-5 py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-leaf-soft disabled:opacity-60"
          >
            {busy ? "Saving…" : "Water the leaf"}
          </button>
          <button onClick={onClose} className="rounded-full border border-line px-5 py-3 text-[15px]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
