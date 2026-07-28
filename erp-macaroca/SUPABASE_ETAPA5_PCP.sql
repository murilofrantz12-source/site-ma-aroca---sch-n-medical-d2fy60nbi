-- Etapa 5: protege a integridade das ordens de producao.
-- As validacoes mantem compatibilidade com registros antigos e atuam nos novos campos.

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

  if order_origin = 'Pedido' and linked_order_id is null then
    raise exception 'Uma OP originada por pedido precisa manter o vinculo com o pedido.'
      using errcode = '22023';
  end if;

  if order_origin = 'Estoque' and linked_order_id is not null then
    raise exception 'Uma OP independente para estoque nao deve apontar para um pedido.'
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
