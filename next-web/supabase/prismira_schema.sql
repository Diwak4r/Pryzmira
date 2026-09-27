create extension if not exists "pgcrypto";

create table if not exists public.releases (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    name text not null,
    company text not null,
    category text not null check (category in ('llm', 'image', 'video', 'audio', 'agent', 'coding', 'robotics', 'other')),
    released_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

create index if not exists releases_released_at_idx on public.releases (released_at desc);

create table if not exists public.artifacts (
    id uuid primary key default gen_random_uuid(),
    release_id uuid not null references public.releases(id) on delete cascade,
    release_slug text not null,
    release_name text not null,
    category text not null check (category in ('llm', 'image', 'video', 'audio', 'agent', 'coding', 'robotics', 'other')),
    platform text not null check (platform in ('x', 'reddit', 'youtube', 'github', 'article', 'other')),
    media_kind text not null check (media_kind in ('video', 'image', 'thread', 'code', 'link')),
    source_url text not null unique,
    video_url text,
    thumbnail_url text,
    title text not null,
    prompt_text text,
    creator_handle text,
    creator_name text,
    posted_at timestamptz not null default now(),
    first_seen_at timestamptz not null default now(),
    engagement_score integer not null default 0,
    tags text[] not null default '{}',
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamptz not null default now()
);

create index if not exists artifacts_status_posted_idx on public.artifacts (status, posted_at desc);
create index if not exists artifacts_status_engagement_idx on public.artifacts (status, engagement_score desc);
create index if not exists artifacts_release_id_idx on public.artifacts (release_id);
create index if not exists artifacts_tags_idx on public.artifacts using gin (tags);

create table if not exists public.submissions (
    id uuid primary key default gen_random_uuid(),
    url text not null unique,
    note text,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    ip_hash text,
    preview_json jsonb,
    artifact_id uuid references public.artifacts(id) on delete set null,
    created_at timestamptz not null default now(),
    reviewed_at timestamptz
);

create index if not exists submissions_status_idx on public.submissions (status, created_at desc);

-- Row Level Security: anonymous visitors may only read approved/public rows.
-- All writes (submit form, cron ingest, moderation) go through server-side
-- routes using the service role key, which bypasses RLS entirely.
alter table public.releases enable row level security;
alter table public.artifacts enable row level security;
alter table public.submissions enable row level security;

create policy "public read releases" on public.releases for select using (true);
create policy "public read approved artifacts" on public.artifacts for select using (status = 'approved');
-- No public policy on submissions — the moderation queue is server-only.
