import type { Book } from "@/lib/catalog";

/**
 * Books as physical objects, not cards:
 * — "cover": a bound book with cloth, spine highlight and progress
 * — "spine": a shelf spine whose height follows the book's length
 */

const CLOTH_TEXTURE =
  "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 4px)";

export function BookCover({
  book,
  pct,
  size = "lg",
  className,
}: {
  book: Book;
  pct?: number;
  size?: "lg" | "md" | "xs";
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-r-md rounded-l-[3px] shadow-[0_14px_30px_-14px_rgba(35,31,24,0.45)] ${className ?? ""}`}
      style={{ background: book.cloth }}
    >
      {/* cloth weave */}
      <div className="absolute inset-0" style={{ backgroundImage: CLOTH_TEXTURE }} />
      {/* spine highlight + hinge */}
      <div className="absolute inset-y-0 left-0 w-[7%] bg-black/25" />
      <div className="absolute inset-y-0 left-[9%] w-px bg-white/20" />
      {/* frame */}
      <div className="absolute inset-[9%] rounded-sm border border-white/25" />
      {size === "xs" ? (
        <div className="absolute inset-0 flex items-start justify-center pt-[14%] px-[10%]">
          <span
            className="font-display text-[9px] leading-[1.25] text-paper"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {book.title}
          </span>
        </div>
      ) : (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-1 px-[16%] text-center text-paper ${
            size === "lg" ? "gap-2" : ""
          }`}
        >
          <span
            className={`font-display leading-snug ${
              size === "lg" ? "text-[clamp(1rem,2.2vw,1.5rem)]" : "text-sm"
            }`}
            style={{ textWrap: "balance" }}
          >
            {book.title}
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] opacity-80">
            {book.author}
          </span>
        </div>
      )}
      {pct !== undefined && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
          <div
            className="h-full bg-paper/90"
            style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function BookSpine({
  book,
  finished,
}: {
  book: Book;
  finished?: boolean;
}) {
  // height follows the book's length: 200–320px range
  const height = 200 + Math.round((book.pages / 520) * 120);
  return (
    <div
      className="group relative flex w-[42px] cursor-pointer items-start justify-center rounded-[3px] shadow-[0_10px_20px_-10px_rgba(35,31,24,0.5)] transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:rotate-[-1.5deg] motion-reduce:transition-none"
      style={{ height, background: book.cloth }}
    >
      <div className="absolute inset-y-0 left-0 w-[3px] bg-black/30" />
      <span
        className="mt-4 font-display text-[11px] leading-none text-paper/95"
        style={{ writingMode: "vertical-rl" }}
      >
        {book.title}
      </span>
      {finished && (
        <span
          aria-label="Finished"
          className="absolute -right-1.5 top-6 flex h-5 w-5 items-center justify-center rounded-full bg-honey text-[10px] text-paper shadow"
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M2 7.5C3 5 6 2 11 2c0 5-3 8-8 7" fill="currentColor" opacity="0.001" />
            <path d="M11 2C6 2 3 5 2 8.5c3 .8 5.5.3 7.5-1.5" />
          </svg>
        </span>
      )}
    </div>
  );
}
