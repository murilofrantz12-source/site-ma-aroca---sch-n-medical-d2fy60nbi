-- Etapa 11: acompanha responsabilidades, treinamento e duvidas da equipe.

begin;

alter table public.erp_records
  drop constraint if exists erp_records_entity_type_check;

alter table public.erp_records
  add constraint erp_records_entity_type_check check (
    entity_type in (
      'brand',
      'raw_material',
      'supplier',
      'customer',
      'product',
      'purchase_order',
      'purchase_note',
      'order',
      'production_order',
      'inventory_entry',
      'inventory_count',
      'implementation_progress',
      'implementation_responsibility',
      'implementation_question',
      'cash_entry',
      'company',
      'pricing'
    )
  );

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
    if requested_entity in (
      'implementation_progress',
      'implementation_responsibility',
      'implementation_question'
    ) then
      return true;
    end if;

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
    if requested_entity in ('implementation_progress', 'implementation_question') then
      return true;
    end if;

    if profile_role = 'Sócia' then
      return requested_entity in ('customer', 'product', 'order', 'production_order', 'inventory_entry');
    elsif profile_role = 'Comercial' then
      return requested_entity in ('customer', 'order');
    elsif profile_role = 'Produção' then
      return requested_entity in ('production_order', 'inventory_entry');
    elsif profile_role = 'Financeiro' then
      return requested_entity in (
        'supplier', 'purchase_order', 'purchase_note', 'inventory_entry',
        'cash_entry', 'pricing', 'order'
      );
    end if;
  end if;

  return false;
end;
$$;

create or replace function public.erp_validate_implementation_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text := public.erp_current_role();
  actor_username text;
begin
  if new.entity_type not in (
    'implementation_progress',
    'implementation_responsibility',
    'implementation_question'
  ) then
    return new;
  end if;

  select username
  into actor_username
  from public.erp_profiles
  where id = auth.uid()
    and active = true;

  if new.entity_type = 'implementation_responsibility' and actor_role <> 'Admin' then
    raise exception 'Somente o Admin pode definir responsabilidades.'
      using errcode = '42501';
  end if;

  if new.entity_type = 'implementation_progress' then
    if length(btrim(coalesce(new.data->>'stepId', ''))) = 0 then
      raise exception 'A atividade do treinamento e obrigatoria.'
        using errcode = '22023';
    end if;

    if actor_role <> 'Admin' and coalesce(new.data->>'userId', '') <> auth.uid()::text then
      raise exception 'Cada pessoa pode atualizar somente o proprio treinamento.'
        using errcode = '42501';
    end if;
  end if;

  if new.entity_type = 'implementation_question' then
    if length(btrim(coalesce(new.data->>'text', ''))) = 0 then
      raise exception 'A duvida nao pode ficar vazia.'
        using errcode = '22023';
    end if;

    if actor_role <> 'Admin' then
      if tg_op = 'UPDATE' then
        raise exception 'Somente o Admin pode encerrar ou reabrir uma duvida.'
          using errcode = '42501';
      end if;

      if coalesce(new.data->>'createdBy', '') <> actor_username then
        raise exception 'A autoria da duvida precisa corresponder ao usuario conectado.'
          using errcode = '42501';
      end if;

      new.data := jsonb_set(new.data, '{resolved}', 'false'::jsonb, true);
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists erp_records_validate_implementation_record on public.erp_records;
create trigger erp_records_validate_implementation_record
before insert or update on public.erp_records
for each row execute function public.erp_validate_implementation_record();

commit;
