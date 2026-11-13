"use client";

import { useState } from "react";
import type { Book } from "@/lib/catalog";
import { makeLeafCard, shareLeafCard } from "@/lib/share";
import { STAGE_NAMES } from "@/lib/streak";

export type LeafDropProps = {
  open: boolean;
  onClose: () => void;
  /** today's state after the session landed */
  streak: number;
  stage: number;
  grew: boolean;
  finishedBook?: Book;
  quote: string;
  book: Book;
  minutes: number;
  pressedEarned: boolean;
};

export function LeafDrop(props: LeafDropProps) {
  const [sharing, setSharing] = useState<"idle" | "busy">("idle");
  if (!props.open) return null;

  const headline = props.finishedBook
    ? "You finished the book"
    : props.grew
      ? "Your plant grew"
      : "Leaf watered";

  const sub = props.finishedBook
    ? `${props.finishedBook.title} joins your shelf`
    : props.pressedEarned
      ? "A pressed leaf earned — it will protect a rainy day"
      : `${STAGE_NAMES[props.stage]} · day ${props.streak} sprint`;

  const share = async () => {
    setSharing("busy");
    try {
      const blob = await makeLeafCard({
        book: props.book,
        streak: props.streak,
        minutes: props.minutes,
        quote: props.quote,
      });
      if (blob) await shareLeafCard(blob, `leafsprint-day-${props.streak}.png`);
    } finally {
      setSharing("idle");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/45 p-4 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Session summary"
    >
      <div className="drop-card w-full max-w-md rounded-3xl border border-line bg-card p-6 pb-5 shadow-2xl">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-leaf">
          {headline}
        </p>
        <p className="mt-1 text-sm text-muted">{sub}</p>

        <div className="mt-5 flex items-end gap-4">
          <span className="font-display text-[64px] leading-none">{props.streak}</span>
          <span className="pb-2 text-sm text-muted">
            {props.streak === 1 ? "day" : "days"} · {props.minutes} min today
          </span>
        </div>

        <figure className="mt-5 rounded-2xl bg-moss/60 p-4">
          <blockquote className="font-display text-[17px] italic leading-relaxed">
            “{props.quote}”
          </blockquote>
          <figcaption className="mt-2 text-xs text-muted">
            {props.book.title} — {props.book.author}
          </figcaption>
        </figure>

        <div className="mt-5 flex gap-2.5">
          <button
            onClick={share}
            className="flex-1 rounded-full bg-leaf px-5 py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-leaf-soft"
          >
            {sharing === "busy" ? "Drawing card…" : "Share the leaf"}
          </button>
          <button
            onClick={props.onClose}
            className="rounded-full border border-line px-5 py-3 text-[15px] text-ink transition-colors hover:bg-moss/60"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
