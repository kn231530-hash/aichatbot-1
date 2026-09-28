create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid,
  role text not null check (role in ('user','assistant')),
  content text not null check (char_length(content) <= 20000),
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

drop policy if exists "allow anonymous message inserts" on public.chat_messages;
drop policy if exists "chat_messages_insert_anon" on public.chat_messages;
create policy "chat_messages_insert_anon"
on public.chat_messages
for insert
to anon, authenticated
with check (role in ('user','assistant'));

drop policy if exists "chat_messages_select_anon" on public.chat_messages;
create policy "chat_messages_select_anon"
on public.chat_messages
for select
to anon, authenticated
using (false);