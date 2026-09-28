create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own"
on public.admin_users
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "chat_messages_admin_select" on public.chat_messages;
create policy "chat_messages_admin_select"
on public.chat_messages
for select
to authenticated
using (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);