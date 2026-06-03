create table if not exists market_cache (
  id           uuid default gen_random_uuid() primary key,
  cache_key    text unique not null,
  data         jsonb not null,
  fetched_at   timestamptz default now(),
  expires_at   timestamptz not null
);

create index if not exists market_cache_key_idx on market_cache(cache_key);
create index if not exists market_cache_expires_idx on market_cache(expires_at);
