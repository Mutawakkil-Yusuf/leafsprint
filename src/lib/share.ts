"use client";

import type { Book } from "./catalog";
import { STAGE_NAMES } from "./streak";

/**
 * The Leaf Card — a shareable image of today's reading, Wordle-style.
 * Rendered on canvas so it needs no assets and works offline.
 */

const W = 1080;
const H = 1350;

export async function makeLeafCard(opts: {
  book: Book;
  streak: number;
  minutes: number;
  quote?: string;
}): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // paper
  ctx.fillStyle = "#f7f2e7";
  ctx.fillRect(0, 0, W, H);

  // quiet frame
  ctx.strokeStyle = "#e3dac6";
  ctx.lineWidth = 3;
  ctx.strokeRect(52, 52, W - 104, H - 104);

  // leaf mark
  ctx.save();
  ctx.translate(W / 2, 250);
  ctx.scale(3.2, 3.2);
  ctx.fillStyle = "#3e6b48";
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.bezierCurveTo(30, -34, 34, 8, 0, 34);
  ctx.bezierCurveTo(-34, 8, -30, -34, 0, -34);
  ctx.fill();
  ctx.strokeStyle = "#f7f2e7";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(0, 30);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = "#231f18";

  // streak headline
  ctx.font = "600 190px Georgia, serif";
  ctx.fillText(String(opts.streak), W / 2, 640);
  ctx.font = "30px Georgia, serif";
  ctx.fillStyle = "#6f6654";
  ctx.fillText(
    opts.streak === 1 ? "day sprint" : "day sprint",
    W / 2,
    690
  );

  // today's quote
  ctx.fillStyle = "#231f18";
  ctx.font = "italic 40px Georgia, serif";
  const quote = (opts.quote ?? opts.book.quote).slice(0, 180);
  const words = quote.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > W - 320) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  const quoteTop = 810;
  lines.slice(0, 4).forEach((l, i) => {
    ctx.fillText(l, W / 2, quoteTop + i * 54);
  });

  // attribution + stats
  ctx.font = "28px Georgia, serif";
  ctx.fillStyle = "#6f6654";
  ctx.fillText(`— ${opts.book.title}, ${opts.book.author}`, W / 2, quoteTop + lines.slice(0, 4).length * 54 + 30);
  ctx.font = "26px Georgia, serif";
  ctx.fillText(`${opts.minutes} min today`, W / 2, H - 170);

  // wordmark
  ctx.fillStyle = "#3e6b48";
  ctx.font = "600 30px Georgia, serif";
  ctx.fillText("leafsprint", W / 2, H - 110);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

export async function shareLeafCard(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean;
    share?: (data: { files?: File[]; title?: string }) => Promise<void>;
  };
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    await nav.share({ files: [file], title: "My Leafsprint" });
    return true;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return false;
}

export function stageName(stage: number): string {
  return STAGE_NAMES[Math.max(0, Math.min(7, stage))];
}
