create extension if not exists pgcrypto;

create table if not exists public.erp_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  role text not null check (role in ('Admin', 'Sócia', 'Comercial', 'Produção', 'Financeiro')),
  active boolean not null default true,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.erp_records (
  environment text not null check (environment in ('production', 'test')),
  entity_type text not null check (
    entity_type in (
      'brand',
      'raw_material',
      'supplier',
      'customer',
      'product',
      'purchase_note',
      'order',
      'production_order',
      'inventory_entry',
      'cash_entry',
      'company',
      'pricing'
    )
  ),
  record_id text not null,
  data jsonb not null,
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid references public.erp_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.erp_profiles(id),
  primary key (environment, entity_type, record_id)
);

create index if not exists erp_records_environment_type_idx
  on public.erp_records (environment, entity_type, updated_at desc);

create table if not exists public.erp_audit_log (
  id bigint generated always as identity primary key,
  environment text not null,
  entity_type text not null,
  record_id text not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  record_version bigint,
  user_id uuid,
  user_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists erp_audit_log_environment_created_idx
  on public.erp_audit_log (environment, created_at desc);

create table if not exists public.erp_backups (
  id bigint generated always as identity primary key,
  environment text not null check (environment in ('production', 'test')),
  snapshot jsonb not null,
  record_count integer not null,
  created_at timestamptz not null default now()
);

create or replace function public.erp_current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.erp_profiles
  where id = auth.uid()
    and active = true
$$;

create or replace function public.erp_can(
  requested_action text,
  requested_entity text,
  requested_environment text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  profile_role text := public.erp_current_role();
begin
  if profile_role is null then
    return false;
  end if;

  if profile_role = 'Admin' then
    return true;
  end if;

  if requested_action = 'delete' then
    return false;
  end if;

  if requested_action = 'read' then
    if profile_role = 'Sócia' then
      return requested_entity <> 'cash_entry';
    elsif profile_role = 'Comercial' then
      return requested_entity in (
        'brand', 'customer', 'product', 'order', 'production_order',
        'inventory_entry', 'company'
      );
    elsif profile_role = 'Produção' then
      return requested_entity in (
        'brand', 'raw_material', 'product', 'order', 'production_order',
        'inventory_entry', 'company'
      );
    elsif profile_role = 'Financeiro' then
      return true;
    end if;
  end if;

  if requested_action = 'write' then
    if profile_role = 'Sócia' then
      return requested_entity in ('customer', 'order', 'production_order', 'inventory_entry');
    elsif profile_role = 'Comercial' then
      return requested_entity in ('customer', 'order');
    elsif profile_role = 'Produção' then
      return requested_entity in ('production_order', 'inventory_entry');
    elsif profile_role = 'Financeiro' then
      return requested_entity in (
        'supplier', 'purchase_note', 'inventory_entry', 'cash_entry',
        'pricing', 'order'
      );
    end if;
  end if;

  return false;
end;
$$;

create or replace function public.erp_prepare_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.version := 1;
    new.created_at := coalesce(new.created_at, now());
    new.created_by := coalesce(new.created_by, auth.uid());
  else
    new.version := old.version + 1;
  end if;

  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists erp_records_prepare on public.erp_records;
create trigger erp_records_prepare
before insert or update on public.erp_records
for each row execute function public.erp_prepare_record();

create or replace function public.erp_record_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  changed_row public.erp_records;
  actor_name text;
begin
  if tg_op = 'DELETE' then
    changed_row := old;
  else
    changed_row := new;
  end if;

  select username into actor_name
  from public.erp_profiles
  where id = auth.uid();

  insert into public.erp_audit_log (
    environment,
    entity_type,
    record_id,
    action,
    old_data,
    new_data,
    record_version,
    user_id,
    user_name
  )
  values (
    changed_row.environment,
    changed_row.entity_type,
    changed_row.record_id,
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then old.data else null end,
    case when tg_op in ('INSERT', 'UPDATE') then new.data else null end,
    changed_row.version,
    auth.uid(),
    coalesce(actor_name, 'Migração do sistema')
  );

  return changed_row;
end;
$$;

drop trigger if exists erp_records_audit on public.erp_records;
create trigger erp_records_audit
after insert or update or delete on public.erp_records
for each row execute function public.erp_record_audit();

create or replace function public.erp_apply_changes(
  requested_environment text,
  changes jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  change_item jsonb;
  change_action text;
  change_entity text;
  change_id text;
  expected_version bigint;
  affected integer;
  saved_row public.erp_records;
  result jsonb := '[]'::jsonb;
begin
  if auth.uid() is null then
    raise exception 'Sessão inválida.' using errcode = '42501';
  end if;

  if requested_environment not in ('production', 'test') then
    raise exception 'Ambiente inválido.' using errcode = '22023';
  end if;

  for change_item in select value from jsonb_array_elements(changes)
  loop
    change_action := change_item->>'action';
    change_entity := change_item->>'entityType';
    change_id := change_item->>'recordId';
    expected_version := coalesce((change_item->>'expectedVersion')::bigint, 0);

    if not public.erp_can(
      case when change_action = 'delete' then 'delete' else 'write' end,
      change_entity,
      requested_environment
    ) then
      raise exception 'Perfil sem permissão para esta ação.' using errcode = '42501';
    end if;

    if change_action = 'insert' then
      insert into public.erp_records (environment, entity_type, record_id, data)
      values (requested_environment, change_entity, change_id, change_item->'data')
      returning * into saved_row;

      result := result || jsonb_build_array(jsonb_build_object(
        'entityType', saved_row.entity_type,
        'recordId', saved_row.record_id,
        'version', saved_row.version,
        'updatedAt', saved_row.updated_at
      ));
    elsif change_action = 'update' then
      update public.erp_records
      set data = change_item->'data'
      where environment = requested_environment
        and entity_type = change_entity
        and record_id = change_id
        and version = expected_version
      returning * into saved_row;

      get diagnostics affected = row_count;
      if affected <> 1 then
        raise exception 'CONFLICT:%:%', change_entity, change_id using errcode = 'P0001';
      end if;

      result := result || jsonb_build_array(jsonb_build_object(
        'entityType', saved_row.entity_type,
        'recordId', saved_row.record_id,
        'version', saved_row.version,
        'updatedAt', saved_row.updated_at
      ));
    elsif change_action = 'delete' then
      delete from public.erp_records
      where environment = requested_environment
        and entity_type = change_entity
        and record_id = change_id
        and version = expected_version;

      get diagnostics affected = row_count;
      if affected <> 1 then
        raise exception 'CONFLICT:%:%', change_entity, change_id using errcode = 'P0001';
      end if;

      result := result || jsonb_build_array(jsonb_build_object(
        'entityType', change_entity,
        'recordId', change_id,
        'deleted', true
      ));
    else
      raise exception 'Ação inválida.' using errcode = '22023';
    end if;
  end loop;

  return result;
end;
$$;

create or replace function public.erp_create_backup(requested_environment text default 'production')
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  backup_id bigint;
begin
  insert into public.erp_backups (environment, snapshot, record_count)
  select
    requested_environment,
    jsonb_build_object(
      'format', 'macaroca-erp-record-backup-v2',
      'createdAt', now(),
      'environment', requested_environment,
      'records', coalesce(jsonb_agg(to_jsonb(records) order by entity_type, record_id), '[]'::jsonb),
      'profiles', (
        select coalesce(
          jsonb_agg(
            jsonb_build_object(
              'id', profiles.id,
              'username', profiles.username,
              'role', profiles.role,
              'active', profiles.active,
              'mustChangePassword', profiles.must_change_password,
              'createdAt', profiles.created_at,
              'updatedAt', profiles.updated_at
            )
            order by profiles.username
          ),
          '[]'::jsonb
        )
        from public.erp_profiles profiles
      )
    ),
    count(*)::integer
  from public.erp_records records
  where environment = requested_environment
  returning id into backup_id;

  delete from public.erp_backups
  where environment = requested_environment
    and created_at < now() - interval '35 days';

  return backup_id;
end;
$$;

alter table public.erp_profiles enable row level security;
alter table public.erp_records enable row level security;
alter table public.erp_audit_log enable row level security;
alter table public.erp_backups enable row level security;

drop policy if exists erp_profiles_read on public.erp_profiles;
drop policy if exists erp_profiles_admin_update on public.erp_profiles;
create policy erp_profiles_read
on public.erp_profiles
for select
to authenticated
using (id = auth.uid() or public.erp_current_role() = 'Admin');
create policy erp_profiles_admin_update
on public.erp_profiles
for update
to authenticated
using (public.erp_current_role() = 'Admin')
with check (public.erp_current_role() = 'Admin');

drop policy if exists erp_records_read on public.erp_records;
drop policy if exists erp_records_insert on public.erp_records;
drop policy if exists erp_records_update on public.erp_records;
drop policy if exists erp_records_delete on public.erp_records;
create policy erp_records_read
on public.erp_records
for select
to authenticated
using (public.erp_can('read', entity_type, environment));
create policy erp_records_insert
on public.erp_records
for insert
to authenticated
with check (public.erp_can('write', entity_type, environment));
create policy erp_records_update
on public.erp_records
for update
to authenticated
using (public.erp_can('write', entity_type, environment))
with check (public.erp_can('write', entity_type, environment));
create policy erp_records_delete
on public.erp_records
for delete
to authenticated
using (public.erp_can('delete', entity_type, environment));

drop policy if exists erp_audit_read on public.erp_audit_log;
create policy erp_audit_read
on public.erp_audit_log
for select
to authenticated
using (public.erp_can('read', entity_type, environment));

drop policy if exists erp_backups_admin_read on public.erp_backups;
create policy erp_backups_admin_read
on public.erp_backups
for select
to authenticated
using (public.erp_current_role() = 'Admin');

grant select on public.erp_profiles, public.erp_records, public.erp_audit_log, public.erp_backups to authenticated;
grant insert, update, delete on public.erp_records to authenticated;
grant update on public.erp_profiles to authenticated;
grant execute on function public.erp_apply_changes(text, jsonb) to authenticated;
revoke execute on function public.erp_create_backup(text) from public, anon, authenticated;

create or replace function public.erp_finish_password_change()
returns void
language sql
security definer
set search_path = public
as $$
  update public.erp_profiles
  set must_change_password = false,
      updated_at = now()
  where id = auth.uid()
$$;

grant execute on function public.erp_finish_password_change() to authenticated;

insert into public.erp_records (environment, entity_type, record_id, data)
select environment_name, entity_type, item->>'id', item
from public.macaroca_app_state source
cross join (values ('production'), ('test')) environments(environment_name)
cross join lateral (
  select 'brand'::text as entity_type, value as item from jsonb_array_elements(source.state->'brands')
  union all select 'raw_material', value from jsonb_array_elements(source.state->'rawMaterials')
  union all select 'supplier', value from jsonb_array_elements(source.state->'suppliers')
  union all select 'customer', value from jsonb_array_elements(source.state->'customers')
  union all select 'product', value from jsonb_array_elements(source.state->'products')
  union all select 'purchase_note', value from jsonb_array_elements(source.state->'purchaseNotes')
  union all select 'order', value from jsonb_array_elements(source.state->'orders')
  union all select 'production_order', value from jsonb_array_elements(source.state->'productionOrders')
  union all select 'inventory_entry', value from jsonb_array_elements(source.state->'inventoryEntries')
  union all select 'cash_entry', value from jsonb_array_elements(source.state->'cashEntries')
) records
where source.id = 'main'
on conflict (environment, entity_type, record_id) do nothing;

insert into public.erp_records (environment, entity_type, record_id, data)
select environment_name, 'company', 'main', source.state->'company'
from public.macaroca_app_state source
cross join (values ('production'), ('test')) environments(environment_name)
where source.id = 'main'
on conflict (environment, entity_type, record_id) do nothing;

insert into public.erp_records (environment, entity_type, record_id, data)
select
  environment_name,
  'pricing',
  'main',
  jsonb_build_object(
    'tax', source.state->'tax',
    'commission', source.state->'commission',
    'fixedCost', source.state->'fixedCost',
    'profit', source.state->'profit'
  )
from public.macaroca_app_state source
cross join (values ('production'), ('test')) environments(environment_name)
where source.id = 'main'
on conflict (environment, entity_type, record_id) do nothing;

alter table public.erp_records replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.erp_records;
exception
  when duplicate_object or undefined_object then null;
end $$;

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    execute 'create extension pg_cron';
  end if;
  perform cron.unschedule(jobid)
  from cron.job
  where jobname = 'macaroca-erp-daily-backup';
  perform cron.schedule(
    'macaroca-erp-daily-backup',
    '0 6 * * *',
    'select public.erp_create_backup(''production'');'
  );
exception
  when insufficient_privilege or undefined_table or undefined_function or feature_not_supported then
    raise notice 'Agendamento automático deverá ser ativado pelo painel do Supabase.';
end $$;

select public.erp_create_backup('production');
