import Link from "next/link";
import { Plant } from "@/components/Plant";
import { BookSpine } from "@/components/BookObject";
import { CATALOG } from "@/lib/catalog";
import { IconPressedLeaf } from "@/components/icons";

export const metadata = {
  title: "Leafsprint — read daily, keep the leaf alive",
  description:
    "An open-source home for building a reading habit: real books in your browser, a streak that grows like a plant, weekly sprints with honest readers.",
};

const MECHANICS = [
  {
    title: "A streak that grows",
    body: "Every day with real reading waters your plant — seed to evergreen. Miss one day and a pressed leaf catches you; that's it. Nothing dies, nothing shames.",
    art: (
      <svg viewBox="0 0 48 48" className="h-12 w-12">
        <circle cx="24" cy="24" r="21" fill="var(--moss)" />
        <path d="M34 10C20 10 12 19 12 33c9 1 17-4 20-9 1.2-2 2-5 2-9z" fill="var(--leaf)" />
        <path d="M14 30C19 22 26 15 32 12" stroke="var(--paper)" strokeWidth="1.4" fill="none" opacity="0.5" />
      </svg>
    ),
  },
  {
    title: "Pressed leaves, not guilt",
    body: "One earned leaf per month quietly saves a missed day. Duolingo's freeze, minus the owl guilt-tripping you at midnight.",
    art: (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-honey/15">
        <IconPressedLeaf className="h-7 w-7 text-honey" />
      </span>
    ),
  },
  {
    title: "Sprints with honest readers",
    body: "Opt-in weekly groves of fifteen, ranked by verified in-app reading minutes. Pages logged from paper books count for your streak — never for the race.",
    art: (
      <svg viewBox="0 0 48 48" className="h-12 w-12">
        <path d="M6 34c8-2 14-8 17-16" stroke="var(--leaf)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="26" cy="12" r="4" fill="var(--leaf)" />
        <circle cx="18" cy="20" r="4" fill="var(--leaf-soft)" />
        <circle cx="32" cy="22" r="4" fill="var(--honey)" />
        <path d="M8 40h32" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  return (
    <main className="relative z-[1]">
      {/* hero */}
      <section className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center px-6 text-center safe-t">
        <div className="rise-in flex flex-col items-center">
          <Plant stage={5} watered className="h-[190px] w-auto md:h-[230px]" />
          <h1 className="mt-2 max-w-[13ch] font-display text-[clamp(2.6rem,7vw,4.6rem)] font-medium leading-[1.04] tracking-tight">
            Read daily.
            <br />
            Keep the leaf alive.
          </h1>
          <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-muted">
            Leafsprint is an open-source home for a reading habit: real books
            in your browser, a streak that grows like a plant, and weekly
            sprints for people who actually read.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-leaf px-7 py-3.5 text-[16px] font-semibold text-paper transition-colors hover:bg-leaf-soft"
            >
              Start reading — free
            </Link>
            <a
              href="https://github.com/leafsprint"
              className="rounded-full border border-line px-7 py-3.5 text-[16px] text-ink transition-colors hover:bg-moss/60"
            >
              View the source
            </a>
          </div>
          <p className="mt-4 text-[13px] text-muted">
            No account to start · no ads · AGPL-3.0
          </p>
        </div>
      </section>

      {/* how it grows — three rows, not cards */}
      <section className="mx-auto max-w-3xl px-6 pb-8">
        <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.2rem)]">
          How it grows
        </h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {MECHANICS.map((m, i) => (
            <div key={m.title} className="flex items-start gap-5 py-7">
              <span className="mt-0.5 shrink-0">{m.art}</span>
              <div>
                <p className="font-display text-[19px]">
                  {i + 1}. {m.title}
                </p>
                <p className="mt-1.5 max-w-[62ch] text-[15px] leading-relaxed text-muted">
                  {m.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* the shelf */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.2rem)]">
          The shelf comes stocked
        </h2>
        <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-muted">
          Eleven classics from Project Gutenberg live in the app — once a book
          is opened it stays on your device, so reading works on a plane, in a
          tunnel, or offline on purpose.
        </p>
        <div className="mt-7 flex flex-wrap items-end gap-4 border-b-4 border-line/70 pb-1">
          {CATALOG.map((b) => (
            <BookSpine key={b.id} book={b} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-block rounded-full bg-leaf px-7 py-3.5 text-[16px] font-semibold text-paper transition-colors hover:bg-leaf-soft"
          >
            Plant your seed
          </Link>
        </div>
      </section>

      <footer className="border-t border-line py-6 text-center text-[13px] text-muted">
        Leafsprint · free software under AGPL-3.0 · built for readers, not scroll
      </footer>
    </main>
  );
}
