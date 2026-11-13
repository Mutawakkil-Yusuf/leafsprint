# Leafsprint

**Read daily. Keep the leaf alive.**

An open-source home for a reading habit: real books in your browser, a
streak that grows like a plant, weekly sprints for people who actually read.

- **Reader** — in-browser EPUB reader (public-domain classics from Project
  Gutenberg), position saved to the page, offline after the first open.
- **Streak** — a plant that grows day by day. Miss a day and an earned
  "Pressed Leaf" quietly saves you. Nothing dies, nothing shames.
- **Sprints** — opt-in weekly groves ranked by *verified in-app reading
  minutes* only; manual logs count for streaks, never for races.
- **Native feel** — installable PWA, offline shell, zero page reloads,
  swipe/keyboard page turns, synthesized sounds (no audio files, no tracking).

## Quickstart

```bash
npm install
npm run dev        # http://localhost:3000
```

Open `/hello` for the landing page. The app itself is fully local-first:
all reading data lives in your browser's IndexedDB (Dexie). Sounds are
synthesized with Web Audio — opt out with the speaker toggle.

## Tech

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind v4 ·
Dexie (IndexedDB, live queries) · epub.js · Web Audio API.

## Supabase (cloud sync, later)

The app runs completely without a backend today. The matching cloud schema
for accounts, cross-device sync, and real groves is in
[`supabase/schema.sql`](supabase/schema.sql) — wire keys via `.env.example`
when ready. Local store and cloud schema share the same shapes on purpose.

## Ethics of the loop

Habit mechanics here follow a deliberate design contract:

1. The game lives **around** the book, never inside the reader.
2. Missing a day never punishes — a Pressed Leaf heals it, gently.
3. Honest minutes only: heartbeats verify in-app time; nothing else races.
4. True north metric is **books finished**, not time-on-app.

## License

AGPL-3.0 — see [LICENSE](LICENSE). Fork it, self-host it, improve it; keep
it open.
