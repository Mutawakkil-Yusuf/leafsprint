"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { CATALOG } from "@/lib/catalog";
import { db } from "@/lib/db";
import { BookSpine } from "@/components/BookObject";
import { IconLeaf } from "@/components/icons";

export default function ShelfPage() {
  const shelf = useLiveQuery(() => db.shelf.toArray(), [], []) ?? [];
  const positions = useLiveQuery(() => db.positions.toArray(), [], []) ?? [];

  const finishedIds = new Set(
    shelf.filter((e) => e.status === "finished").map((e) => e.bookId)
  );
  const started = new Map(positions.map((p) => [p.bookId, p.pct]));
  const startedIds = new Set(started.keys());

  const catalog = CATALOG.filter((b) => b.id[0] !== undefined); // all
  const inProgress = CATALOG.filter((b) => startedIds.has(b.id) && !finishedIds.has(b.id));
  const finished = CATALOG.filter((b) => finishedIds.has(b.id));
  const untouched = catalog.filter((b) => !startedIds.has(b.id) && !finishedIds.has(b.id));

  return (
    <div className="mx-auto max-w-2xl">
      <header className="rise-in">
        <h1 className="font-display text-[26px] leading-tight">Shelf</h1>
        <p className="mt-1 text-sm text-muted">
          Spines grow taller as books grow longer. Finished ones wear a leaf.
        </p>
      </header>

      {inProgress.length > 0 && (
        <section className="rise-in mt-6" style={{ animationDelay: "40ms" }}>
          <h2 className="text-sm text-muted">Reading now</h2>
          <div className="mt-3 flex flex-wrap gap-4">
            {inProgress.map((b) => (
              <Link key={b.id} href={`/read/${b.id}`} aria-label={`Continue ${b.title}`}>
                <div className="relative">
                  <BookSpine book={b} />
                  <div className="mt-2 h-1 w-[42px] overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full bg-leaf"
                      style={{ width: `${Math.max(2, started.get(b.id) ?? 0)}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section className="rise-in mt-8" style={{ animationDelay: "80ms" }}>
          <h2 className="text-sm text-muted">Finished</h2>
          <div className="mt-3 flex flex-wrap items-end gap-4 border-b-4 border-line/70 pb-1">
            {finished.map((b) => (
              <Link key={b.id} href={`/read/${b.id}`} aria-label={`Revisit ${b.title}`}>
                <BookSpine book={b} finished />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rise-in mt-8" style={{ animationDelay: "120ms" }}>
        <h2 className="text-sm text-muted">
          {finished.length > 0 || inProgress.length > 0 ? "The shelf" : "All books"}
        </h2>
        <div className="mt-3 flex flex-wrap items-end gap-4 border-b-4 border-line/70 pb-1">
          {untouched.map((b) => (
            <Link key={b.id} href={`/read/${b.id}`} aria-label={`Start ${b.title}`}>
              <BookSpine book={b} />
            </Link>
          ))}
        </div>
        {untouched.length === 0 && (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted">
            <IconLeaf className="h-4 w-4 text-leaf" />
            Every spine opened. The garden thanks you.
          </p>
        )}
      </section>

      <p className="mt-6 text-center text-[12px] text-muted">
        All titles are public domain via Project Gutenberg, stored on your
        device after the first open.
      </p>
    </div>
  );
}
