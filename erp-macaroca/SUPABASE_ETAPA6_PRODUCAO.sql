-- Etapa 6: protege ordens e lancamentos de producao no banco compartilhado.
-- O script e compativel com lancamentos antigos, que nao possuam "type".

create or replace function public.erp_validate_production_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  order_origin text := new.data->>'origin';
  linked_order_id text := nullif(btrim(coalesce(new.data->>'orderId', '')), '');
  order_status text := new.data->>'status';
  planned_qty numeric := coalesce((new.data->>'qty')::numeric, 0);
  produced_qty numeric := coalesce((new.data->>'produced')::numeric, 0);
  launched_production_qty numeric := 0;
  invalid_launch_count integer := 0;
  duplicate_launch_count integer := 0;
begin
  if new.entity_type <> 'production_order' then
    return new;
  end if;

  if planned_qty <= 0 then
    raise exception 'A quantidade planejada da OP deve ser maior que zero.'
      using errcode = '22023';
  end if;

  if produced_qty < 0 or produced_qty > planned_qty then
    raise exception 'A quantidade produzida deve estar entre zero e o total da OP.'
      using errcode = '22023';
  end if;

  if order_status = 'Finalizada' and produced_qty < planned_qty then
    raise exception 'A OP somente pode ser finalizada quando toda a quantidade estiver pronta.'
      using errcode = '22023';
  end if;

  if order_origin = 'Pedido' and linked_order_id is null then
    raise exception 'Uma OP originada por pedido precisa manter o vinculo com o pedido.'
      using errcode = '22023';
  end if;

  if order_origin = 'Estoque' and linked_order_id is not null then
    raise exception 'Uma OP independente para estoque nao deve apontar para um pedido.'
      using errcode = '22023';
  end if;

  select
    coalesce(sum(
      case
        when coalesce(launch->>'type', 'Produção') = 'Produção'
          then coalesce((launch->>'qty')::numeric, 0)
        else 0
      end
    ), 0),
    count(*) filter (
      where coalesce((launch->>'qty')::numeric, 0) <= 0
        or coalesce(launch->>'type', 'Produção') not in ('Produção', 'Perda', 'Defeito', 'Retrabalho')
        or (
          coalesce(launch->>'type', 'Produção') <> 'Produção'
          and length(btrim(coalesce(launch->>'notes', ''))) = 0
        )
    )
  into launched_production_qty, invalid_launch_count
  from jsonb_array_elements(coalesce(new.data->'launches', '[]'::jsonb)) launch;

  select count(*)
  into duplicate_launch_count
  from (
    select launch->>'id'
    from jsonb_array_elements(coalesce(new.data->'launches', '[]'::jsonb)) launch
    group by launch->>'id'
    having count(*) > 1
  ) duplicated;

  if invalid_launch_count > 0 then
    raise exception 'Existe lancamento de producao invalido ou sem justificativa.'
      using errcode = '22023';
  end if;

  if duplicate_launch_count > 0 then
    raise exception 'O historico da OP possui lancamentos duplicados.'
      using errcode = '23505';
  end if;

  if launched_production_qty > produced_qty then
    raise exception 'Os lancamentos de pecas prontas excedem o total produzido da OP.'
      using errcode = '22023';
  end if;

  if order_origin = 'Pedido'
    and order_status <> 'Finalizada'
    and exists (
      select 1
      from public.erp_records existing
      where existing.environment = new.environment
        and existing.entity_type = 'production_order'
        and existing.record_id <> new.record_id
        and existing.data->>'orderId' = linked_order_id
        and coalesce(existing.data->>'status', '') <> 'Finalizada'
    ) then
    raise exception 'Este pedido ja possui uma OP aberta.'
      using errcode = '23505';
  end if;

  return new;
end;
$$;

drop trigger if exists erp_records_validate_production_order on public.erp_records;
create trigger erp_records_validate_production_order
before insert or update on public.erp_records
for each row execute function public.erp_validate_production_order();
