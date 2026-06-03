create table if not exists signals (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  created_at    timestamptz default now(),

  type          text not null check (type in ('buy', 'sell', 'wait')),
  confidence    integer not null check (confidence between 0 and 100),
  timeframe     text not null,
  session       text,

  entry         numeric(10,2),
  stop_loss     numeric(10,2),
  tp1           numeric(10,2),
  tp2           numeric(10,2),
  risk_reward   text,

  price_at      numeric(10,2),
  bias_m1       text,
  bias_m5       text,
  bias_m15      text,
  bias_h1       text,
  bias_h4       text,
  bias_d1       text,
  rsi_m15       numeric(5,2),
  atr_m15       numeric(8,4),

  outcome       text check (outcome in ('win', 'loss', 'breakeven')),
  pips_result   numeric(6,1),
  notes         text,

  ai_analysis   text
);

create index if not exists signals_user_id_idx on signals(user_id);
create index if not exists signals_created_at_idx on signals(created_at desc);

alter table signals enable row level security;

create policy "Users can manage own signals"
  on signals for all using (auth.uid() = user_id);
