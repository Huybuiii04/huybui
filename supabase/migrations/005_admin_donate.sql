-- 005_admin_donate.sql
-- Module: admin / donate / rate limit

begin;

create table if not exists public.donation_settings (
  id boolean primary key default true check (id),
  methods jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '{}'::jsonb,
  qr_path text not null default '',
  is_configured boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  target text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rate_limit_buckets (
  bucket_key text not null,
  operation text not null,
  window_start timestamptz not null,
  counter integer not null default 0,
  primary key (bucket_key, operation, window_start)
);

create index if not exists admin_audit_logs_created_idx on public.admin_audit_logs (created_at desc);

drop trigger if exists donation_settings_set_updated_at on public.donation_settings;
create trigger donation_settings_set_updated_at
before update on public.donation_settings
for each row execute function private.set_updated_at();

alter table public.donation_settings enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.rate_limit_buckets enable row level security;

drop policy if exists donation_settings_read on public.donation_settings;
create policy donation_settings_read on public.donation_settings
for select to anon, authenticated using (true);

revoke all on public.donation_settings from anon;
revoke all on public.admin_audit_logs from anon;
revoke all on public.rate_limit_buckets from anon;
revoke all on public.admin_audit_logs from authenticated;
revoke all on public.rate_limit_buckets from authenticated;
grant select on public.donation_settings to anon, authenticated;

insert into public.donation_settings (id, is_configured)
values (true, false)
on conflict (id) do nothing;

commit;
