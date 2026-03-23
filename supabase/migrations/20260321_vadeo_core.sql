create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_profiles (
  app_user_id text primary key,
  email text not null unique,
  full_name text,
  picture text,
  is_admin boolean not null default false,
  credits integer not null default 50,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_trials (
  app_user_id text primary key references public.user_profiles(app_user_id) on delete cascade,
  started_at timestamptz,
  expires_at timestamptz,
  motion_downloads_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_subscriptions (
  app_user_id text primary key references public.user_profiles(app_user_id) on delete cascade,
  plan text not null default 'none' check (plan in ('none', 'starter', 'standard', 'premium')),
  status text not null default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  cancel_at_period_end boolean not null default false,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generation_usage (
  app_user_id text primary key references public.user_profiles(app_user_id) on delete cascade,
  successful_generations integer not null default 0,
  motion_ai_jobs_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  app_user_id text not null references public.user_profiles(app_user_id) on delete cascade,
  name text not null default 'Untitled Design',
  editor_state jsonb not null default '{}'::jsonb,
  thumbnail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_app_user_id on public.projects(app_user_id);
create index if not exists idx_projects_updated_at on public.projects(updated_at desc);

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_user_trials_updated_at on public.user_trials;
create trigger set_user_trials_updated_at
before update on public.user_trials
for each row execute function public.set_updated_at();

drop trigger if exists set_user_subscriptions_updated_at on public.user_subscriptions;
create trigger set_user_subscriptions_updated_at
before update on public.user_subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists set_generation_usage_updated_at on public.generation_usage;
create trigger set_generation_usage_updated_at
before update on public.generation_usage
for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

alter table public.user_profiles enable row level security;
alter table public.user_trials enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.generation_usage enable row level security;
alter table public.projects enable row level security;
