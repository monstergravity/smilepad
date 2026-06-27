create extension if not exists citext with schema extensions;

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email extensions.citext not null unique,
  source text not null default 'homepage',
  locale text not null default 'en-US',
  created_at timestamptz not null default now(),
  constraint waitlist_signups_email_format check (
    email::text ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  constraint waitlist_signups_source_check check (source = 'homepage'),
  constraint waitlist_signups_locale_check check (locale = 'en-US')
);

alter table public.waitlist_signups enable row level security;

revoke all on table public.waitlist_signups from anon;
revoke all on table public.waitlist_signups from authenticated;
grant insert on table public.waitlist_signups to anon;
grant select, insert, update, delete on table public.waitlist_signups to service_role;

drop policy if exists "Anon can join SmilePad waitlist" on public.waitlist_signups;
create policy "Anon can join SmilePad waitlist"
on public.waitlist_signups
for insert
to anon
with check (
  source = 'homepage'
  and locale = 'en-US'
  and email::text ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
);

notify pgrst, 'reload schema';
