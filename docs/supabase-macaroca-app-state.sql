create table if not exists public.macaroca_app_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_by text,
  updated_at timestamptz not null default now()
);

alter table public.macaroca_app_state enable row level security;

drop policy if exists "Permitir leitura do sistema Macaroca" on public.macaroca_app_state;
create policy "Permitir leitura do sistema Macaroca"
on public.macaroca_app_state
for select
to anon, authenticated
using (true);

drop policy if exists "Permitir salvar sistema Macaroca" on public.macaroca_app_state;
create policy "Permitir salvar sistema Macaroca"
on public.macaroca_app_state
for insert
to anon, authenticated
with check (id = 'main');

drop policy if exists "Permitir atualizar sistema Macaroca" on public.macaroca_app_state;
create policy "Permitir atualizar sistema Macaroca"
on public.macaroca_app_state
for update
to anon, authenticated
using (id = 'main')
with check (id = 'main');

insert into public.macaroca_app_state (id, data, updated_by)
values ('main', '{}'::jsonb, 'setup')
on conflict (id) do nothing;
