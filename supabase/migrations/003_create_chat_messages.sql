create table if not exists chat_messages (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  created_at  timestamptz default now(),

  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  signal_id   uuid references signals(id) on delete set null
);

create index if not exists chat_messages_user_id_idx on chat_messages(user_id);
create index if not exists chat_messages_created_at_idx on chat_messages(created_at desc);

alter table chat_messages enable row level security;

create policy "Users can manage own messages"
  on chat_messages for all using (auth.uid() = user_id);
