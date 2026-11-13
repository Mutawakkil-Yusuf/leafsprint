-- Leafsprint cloud schema (for later: accounts, sync, real groves).
-- The local IndexedDB store mirrors these shapes on purpose, so sync code
-- can upsert tables without translation.

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default 'Reader',
  timezone text not null default 'UTC',
  reminder_at time,
  sprint_opt_in boolean not null default false,
  theme text not null default 'system',
  created_at timestamptz not null default now()
);

create table if not exists books (
  id text primary key,             -- Gutenberg text number
  title text not null,
  author text not null,
  pages integer not null
);

create table if not exists user_books (
  user_id uuid references profiles(id) on delete cascade,
  book_id text references books(id) on delete cascade,
  status text not null default 'reading' check (status in ('reading','finished')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  primary key (user_id, book_id)
);

create table if not exists positions (
  user_id uuid references profiles(id) on delete cascade,
  book_id text references books(id) on delete cascade,
  pct numeric not null default 0,
  cfi text,
  at timestamptz not null default now(),
  primary key (user_id, book_id)
);

create table if not exists reading_sessions (
  id bigserial primary key,
  user_id uuid references profiles(id) on delete cascade,
  -- user-local day: the streak boundary is the reader's midnight, never UTC
  day date not null,
  book_id text references books(id) on delete cascade,
  minutes integer not null check (minutes >= 0),
  pages integer not null default 0,
  source text not null check (source in ('read','log')),
  verified boolean not null default false,
  at timestamptz not null default now()
);
create index if not exists sessions_user_day on reading_sessions (user_id, day);

create table if not exists pressed_leaves (
  id bigserial primary key,
  user_id uuid references profiles(id) on delete cascade,
  month date not null,             -- first of month, one earned leaf each
  granted_at timestamptz not null default now(),
  used_for_day date,
  unique (user_id, month)
);

-- leaderboard: verified in-app minutes only — manual logs never race
create materialized view if not exists sprint_grove as
select
  user_id,
  date_trunc('week', day)::date as week_start,
  sum(minutes) filter (where verified) as verified_minutes,
  count(*) filter (where verified) as sessions
from reading_sessions
group by user_id, date_trunc('week', day)::date;

create unique index if not exists sprint_grove_key on sprint_grove (user_id, week_start);

alter table reading_sessions enable row level security;
alter table pressed_leaves enable row level security;
alter table positions enable row level security;
alter table user_books enable row level security;
alter table profiles enable row level security;

create policy "own rows" on reading_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on pressed_leaves
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on positions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on user_books
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- grove names mirror the app ladder: Sprout → Sapling → Bough →
-- Canopy → Grove → Forest → Evergreen (client-side for now).
