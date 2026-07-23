create table if not exists public.macaroca_app_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.macaroca_app_state enable row level security;

drop policy if exists "macaroca_app_state_read" on public.macaroca_app_state;
drop policy if exists "macaroca_app_state_insert" on public.macaroca_app_state;
drop policy if exists "macaroca_app_state_update" on public.macaroca_app_state;

create policy "macaroca_app_state_read"
on public.macaroca_app_state
for select
to anon, authenticated
using (id = 'main');

create policy "macaroca_app_state_insert"
on public.macaroca_app_state
for insert
to anon, authenticated
with check (id = 'main');

create policy "macaroca_app_state_update"
on public.macaroca_app_state
for update
to anon, authenticated
using (id = 'main')
with check (id = 'main');

alter table public.macaroca_app_state replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.macaroca_app_state;
exception
  when duplicate_object or undefined_object then null;
end $$;
