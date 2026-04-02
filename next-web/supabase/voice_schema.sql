create extension if not exists "pgcrypto";

create table if not exists public.voice_profiles (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    sample_text text not null,
    analysis_json jsonb not null,
    voice_insights text not null,
    insight_bullets jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists voice_profiles_user_id_idx on public.voice_profiles (user_id);
create index if not exists voice_profiles_created_at_idx on public.voice_profiles (created_at desc);

create table if not exists public.voice_generations (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    profile_id uuid references public.voice_profiles(id) on delete set null,
    writing_task text not null,
    extra_instructions text,
    output_text text not null,
    preview text not null,
    created_at timestamptz not null default now()
);

create index if not exists voice_generations_user_id_idx on public.voice_generations (user_id);
create index if not exists voice_generations_created_at_idx on public.voice_generations (created_at desc);

create table if not exists public.voice_usage (
    id uuid primary key default gen_random_uuid(),
    subject_key text not null,
    subject_type text not null check (subject_type in ('anonymous', 'user')),
    window_key text not null,
    usage_count integer not null default 0,
    limit_count integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index if not exists voice_usage_subject_window_idx
    on public.voice_usage (subject_key, window_key);
