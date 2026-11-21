create table if not exists introductions (
  user_id text primary key,
  name text not null,
  body text not null,
  updated_at timestamptz not null default now()
);
