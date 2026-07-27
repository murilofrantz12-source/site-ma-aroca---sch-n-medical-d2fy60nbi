create table if not exists public.macaroca_app_state_test (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.macaroca_app_state_test enable row level security;

drop policy if exists "macaroca_app_state_test_read" on public.macaroca_app_state_test;
drop policy if exists "macaroca_app_state_test_insert" on public.macaroca_app_state_test;
drop policy if exists "macaroca_app_state_test_update" on public.macaroca_app_state_test;

create policy "macaroca_app_state_test_read"
on public.macaroca_app_state_test
for select
to anon, authenticated
using (id = 'main');

create policy "macaroca_app_state_test_insert"
on public.macaroca_app_state_test
for insert
to anon, authenticated
with check (id = 'main');

create policy "macaroca_app_state_test_update"
on public.macaroca_app_state_test
for update
to anon, authenticated
using (id = 'main')
with check (id = 'main');

alter table public.macaroca_app_state_test replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.macaroca_app_state_test;
exception
  when duplicate_object or undefined_object then null;
end $$;
