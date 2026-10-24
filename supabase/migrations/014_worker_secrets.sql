-- 014_worker_secrets.sql
--
-- Secret nội bộ cho worker (dùng khi project không có extension `vault`).
-- Bảng nằm trong schema `private` — PostgREST không expose schema này nên client
-- không đọc được. Chỉ service_role truy cập trực tiếp.
--
-- Idempotent: chạy lại nhiều lần không lỗi.

begin;

create table if not exists private.worker_secrets (
  name text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

revoke all on private.worker_secrets from anon, authenticated;
grant select, insert, update on private.worker_secrets to service_role;

comment on table private.worker_secrets is
  'Secret nội bộ cho Edge Function worker. Ghi bằng npm run db:cron, không ghi trong migration.';

commit;
