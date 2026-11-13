"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Book as EpubBook, Rendition } from "epubjs";
import { bookFile, getBook, type Book } from "@/lib/catalog";
import { db, markFinished, saveSession } from "@/lib/db";
import { pageTurn, unlockAudio } from "@/lib/sounds";
import { IconBack, IconSoundOff, IconSoundOn } from "@/components/icons";

type ReaderTheme = "paper" | "sepia" | "night";

const THEME_STYLES: Record<ReaderTheme, { bg: string; fg: string; link: string }> = {
  paper: { bg: "#f7f2e7", fg: "#231f18", link: "#3e6b48" },
  sepia: { bg: "#ecdfc4", fg: "#4a3c2a", link: "#5a7a52" },
  night: { bg: "#211c14", fg: "#e8dfca", link: "#8fb98b" },
};

const FONT_STEPS = [1, 1.125, 1.25, 1.4, 1.6];

export function ReaderClient({ bookId }: { bookId: string }) {
  const book = getBook(bookId) as Book;
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const epubRef = useRef<EpubBook | null>(null);

  // session tracking
  const startPct = useRef<number | null>(null);
  const lastPct = useRef(0);
  const turns = useRef(0);
  const activeSecs = useRef(0);
  const lastInteraction = useRef(0);
  const startedAt = useRef(0);
  const soundRef = useRef(true);
  const saved = useRef(false);

  const [title, setTitle] = useState(book.title);
  const [chapter, setChapter] = useState("");
  const [pct, setPct] = useState(0);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<ReaderTheme>("paper");
  const [fontIdx, setFontIdx] = useState(1);
  const [soundOn, setSoundOn] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const interact = () => {
    lastInteraction.current = Date.now();
  };

  const turn = (dir: "next" | "prev") => {
    interact();
    if (soundRef.current) pageTurn();
    turns.current++;
    void renditionRef.current?.[dir]();
  };

  // keyboard: arrows / j-k — same handler serves the parent window and the
  // epub iframe (events never cross between the two documents)
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "j") turn("next");
    if (e.key === "ArrowLeft" || e.key === "k") turn("prev");
  };

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  // restore reader preferences at mount
  useEffect(() => {
    void (async () => {
      const now = Date.now();
      lastInteraction.current = now;
      startedAt.current = now;

      const stored = localStorage.getItem("leafsprint-reader");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { theme?: ReaderTheme; fontIdx?: number };
          if (parsed.theme) setTheme(parsed.theme);
          if (typeof parsed.fontIdx === "number") setFontIdx(parsed.fontIdx);
        } catch {
          /* ignore */
        }
      }
      setSoundOn(localStorage.getItem("leafsprint-sound") !== "off");
    })();
  }, []);

  // load the EPUB
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(bookFile(bookId));
        if (!res.ok) throw new Error("Book not found");
        const buffer = await res.arrayBuffer();
        if (cancelled) return;
        const ePub = (await import("epubjs")).default;
        const epub = ePub(buffer as ArrayBuffer);
        epubRef.current = epub;

        const meta = await epub.loaded.metadata;
        if (!cancelled) setTitle(meta.title ?? book.title);

        const nav = await epub.loaded.navigation;
        if (!cancelled) setChapter(nav.toc[0]?.label?.trim() ?? "");

        const rendition = epub.renderTo(containerRef.current!, {
          width: "100%",
          height: "100%",
          flow: "paginated",
          spread: "none",
          minSpreadWidth: 1200,
        });
        renditionRef.current = rendition;

        const applyTheme = (t: ReaderTheme, fIdx: number) => {
          const s = THEME_STYLES[t];
          rendition.themes.override("color", s.fg);
          rendition.themes.override("background", s.bg);
          rendition.themes.fontSize(`${FONT_STEPS[fIdx]}rem`);
        };

        // restore position
        const pos = await db.positions.get(bookId);
        await rendition.display(pos?.cfi ?? undefined);
        if (pos) {
          lastPct.current = pos.pct;
          setPct(pos.pct);
        }

        applyTheme(theme, fontIdx);
        (rendition as Rendition & { __apply?: typeof applyTheme }).__apply = applyTheme;

        rendition.on("relocated", (location: { start: { cfi: string; percentage: number; href: string } }) => {
          const p = Math.round((location.start.percentage ?? 0) * 100);
          lastPct.current = p;
          setPct(p);
          if (startPct.current === null) startPct.current = p;
          if (location.start.href) {
            const sec = nav.toc.find((t) => location.start.href.includes(t.href));
            if (sec) setChapter(sec.label?.trim() ?? "");
          }
          void db.positions.put({ bookId, pct: p, cfi: location.start.cfi, at: Date.now() });
        });

        // gestures: swipe detection via relayed touch deltas (deltas hold in
        // any coordinate space); tap zones live in the parent DOM as overlay
        // strips, since relayed click coordinates can be scaled arbitrarily
        let tx: number | null = null;
        let ty: number | null = null;

        const onTouchStart = (e: TouchEvent) => {
          tx = e.touches[0].clientX;
          ty = e.touches[0].clientY;
        };
        const onTouchEnd = (e: TouchEvent) => {
          if (tx === null || ty === null) return;
          const dx = e.changedTouches[0].clientX - tx;
          const dy = e.changedTouches[0].clientY - ty;
          tx = ty = null;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
            turn(dx < 0 ? "next" : "prev");
          } else {
            interact();
          }
        };
        rendition.on("click", interact);
        rendition.on("touchstart", onTouchStart);
        rendition.on("touchend", onTouchEnd);
        rendition.on("keydown", onKey);
        window.addEventListener("keydown", onKey);

        if (!cancelled) setReady(true);
      } catch (err) {
        console.error(err);
        if (!cancelled) setReady(false);
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      void epubRef.current?.destroy();
      epubRef.current = null;
      renditionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  // apply theme/font changes live
  useEffect(() => {
    const rendition = renditionRef.current as
      | (Rendition & { __apply?: (t: ReaderTheme, fIdx: number) => void })
      | null;
    rendition?.__apply?.(theme, fontIdx);
    document.documentElement.dataset.reader = theme;
    localStorage.setItem(
      "leafsprint-reader",
      JSON.stringify({ theme, fontIdx })
    );
  }, [theme, fontIdx, ready]);

  // heartbeat: accumulate active time only while the reader is truly active
  useEffect(() => {
    const id = window.setInterval(() => {
      if (Date.now() - lastInteraction.current < 60_000) {
        activeSecs.current += 15;
      }
    }, 15_000);
    return () => window.clearInterval(id);
  }, []);

  const finalize = async (reason: "back" | "pagehide") => {
    const active = activeSecs.current;

    // a few seconds of peeking is not a reading session — but back still works
    if (!saved.current && active >= 25) {
      saved.current = true;

      const minutes = Math.max(1, Math.round(active / 60));
      const deltaPct = Math.max(0, lastPct.current - (startPct.current ?? 0));
      const pagesFromPct = Math.round((deltaPct / 100) * book.pages);
      const pagesFromTurns = Math.round(turns.current * 0.6);
      const pages = Math.max(1, Math.max(pagesFromPct, pagesFromTurns));

      await saveSession({
        bookId,
        minutes,
        pages,
        source: "read",
        verified: true,
      });

      // finished the book? quiet mark — Today owns the fanfare
      if (lastPct.current >= 99.5) {
        await markFinished(bookId);
      }
    }

    if (reason === "back") router.push("/");
  };

  // save on unmount + page hide
  useEffect(() => {
    const onHide = () => void finalize("pagehide");
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      void finalize("pagehide");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // window-side keyboard (the epub iframe side is wired at rendition setup;
  // events never cross between the two documents)
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nightChrome = theme === "night";

  return (
    <div
      className={`fixed inset-0 z-[80] flex flex-col ${nightChrome ? "night-reader" : ""}`}
      style={{ background: THEME_STYLES[theme].bg, color: THEME_STYLES[theme].fg }}
    >
      {/* progress hairline */}
      <div className="absolute inset-x-0 top-0 z-10 h-[3px] bg-black/10">
        <div
          className="h-full transition-[width] duration-300"
          style={{ width: `${pct}%`, background: THEME_STYLES[theme].link }}
        />
      </div>

      {/* top chrome */}
      <header className="relative z-10 flex items-center justify-between px-4 safe-t">
        <button
          onClick={() => void finalize("back")}
          aria-label="Back to Today"
          className="p-2.5 opacity-70 transition-opacity hover:opacity-100"
        >
          <IconBack className="h-5 w-5" />
        </button>
        <p className="min-w-0 truncate px-2 text-center font-display text-[13px] opacity-60">
          {title}
        </p>
        <button
          onClick={() => setSettingsOpen((o) => !o)}
          aria-expanded={settingsOpen}
          aria-label="Reader settings"
          className="p-2.5 opacity-70 transition-opacity hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3.2" />
            <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8" />
          </svg>
        </button>
      </header>

      {/* settings popover */}
      {settingsOpen && (
        <div
          className="absolute right-4 top-[52px] z-20 w-64 rounded-2xl border p-4 shadow-xl"
          style={{
            background: THEME_STYLES[theme].bg,
            borderColor: nightChrome ? "#383023" : "#e3dac6",
          }}
        >
          <p className="text-[12px] uppercase tracking-[0.14em] opacity-50">Text</p>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => setFontIdx((i) => Math.max(0, i - 1))}
              className="flex-1 rounded-full border px-3 py-2 text-[14px] disabled:opacity-40"
              style={{ borderColor: nightChrome ? "#383023" : "#e3dac6" }}
              disabled={fontIdx === 0}
              aria-label="Smaller text"
            >
              A−
            </button>
            <button
              onClick={() => setFontIdx((i) => Math.min(FONT_STEPS.length - 1, i + 1))}
              className="flex-1 rounded-full border px-3 py-2 text-[17px] disabled:opacity-40"
              style={{ borderColor: nightChrome ? "#383023" : "#e3dac6" }}
              disabled={fontIdx === FONT_STEPS.length - 1}
              aria-label="Larger text"
            >
              A+
            </button>
          </div>
          <p className="mt-4 text-[12px] uppercase tracking-[0.14em] opacity-50">Light</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {(["paper", "sepia", "night"] as ReaderTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                aria-pressed={theme === t}
                className={`rounded-lg py-2 text-[12px] capitalize transition-transform ${
                  theme === t ? "ring-2 ring-offset-1" : "hover:scale-[1.03]"
                }`}
                style={{
                  background: THEME_STYLES[t].bg,
                  color: THEME_STYLES[t].fg,
                  border: `1px solid ${nightChrome ? "#383023" : "#e3dac6"}`,
                  ...(theme === t
                    ? { boxShadow: `0 0 0 2px ${THEME_STYLES[theme].link}` }
                    : {}),
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              localStorage.setItem("leafsprint-sound", next ? "on" : "off");
              unlockAudio();
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border py-2.5 text-[14px]"
            style={{ borderColor: nightChrome ? "#383023" : "#e3dac6" }}
          >
            {soundOn ? <IconSoundOn className="h-4 w-4" /> : <IconSoundOff className="h-4 w-4" />}
            {soundOn ? "Sounds on" : "Sounds off"}
          </button>
        </div>
      )}

      {/* the book itself — the game layer never enters here */}
      <div className="relative flex-1">
        <div ref={containerRef} className="h-full w-full" />
        {/* invisible turn strips: parent-space taps, immune to the epub
            iframe's arbitrary coordinate scaling */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="Previous page"
          onClick={() => turn("prev")}
          className="absolute inset-y-0 left-0 z-[5] w-[24%] cursor-default bg-transparent focus:outline-none"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Next page"
          onClick={() => turn("next")}
          className="absolute inset-y-0 right-0 z-[5] w-[24%] cursor-default bg-transparent focus:outline-none"
        />
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current opacity-20 border-t-current motion-reduce:animate-none" />
            <p className="text-[13px] opacity-60">Opening the book…</p>
          </div>
        )}
      </div>

      {/* bottom chrome */}
      <footer className="relative z-10 px-6 pb-2 text-center safe-b">
        <p className="truncate text-[12px] opacity-50">{chapter}</p>
      </footer>
    </div>
  );
}
