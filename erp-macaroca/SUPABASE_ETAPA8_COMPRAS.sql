-- Etapa 8: protege pedidos de compra e recebimentos no banco compartilhado.

create or replace function public.erp_validate_purchase_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text := public.erp_current_role();
  ordered_qty numeric;
  received_qty numeric;
  receipt_qty numeric;
  unit_cost numeric;
  purchase_status text;
begin
  if new.entity_type not in ('purchase_order', 'purchase_note') then
    return new;
  end if;

  if actor_role not in ('Admin', 'Financeiro') then
    raise exception 'Somente Administracao ou Financeiro pode registrar compras e recebimentos.'
      using errcode = '42501';
  end if;

  if new.entity_type = 'purchase_order' then
    ordered_qty := coalesce((new.data->>'qty')::numeric, 0);
    received_qty := coalesce((new.data->>'receivedQty')::numeric, 0);
    unit_cost := coalesce((new.data->>'unitCost')::numeric, -1);
    purchase_status := coalesce(new.data->>'status', '');

    if ordered_qty <= 0 then
      raise exception 'A quantidade do pedido de compra deve ser maior que zero.'
        using errcode = '22023';
    end if;

    if received_qty < 0 or received_qty > ordered_qty then
      raise exception 'A quantidade recebida deve estar entre zero e a quantidade pedida.'
        using errcode = '22023';
    end if;

    if unit_cost < 0 then
      raise exception 'O custo previsto da compra nao pode ser negativo.'
        using errcode = '22023';
    end if;

    if purchase_status not in ('Enviado', 'Parcial', 'Recebido', 'Cancelado') then
      raise exception 'Situacao do pedido de compra invalida.'
        using errcode = '22023';
    end if;

    if purchase_status = 'Recebido' and received_qty <> ordered_qty then
      raise exception 'Um pedido recebido precisa ter toda a quantidade registrada.'
        using errcode = '22023';
    end if;

    if purchase_status = 'Parcial' and (received_qty <= 0 or received_qty >= ordered_qty) then
      raise exception 'Um recebimento parcial precisa deixar quantidade pendente.'
        using errcode = '22023';
    end if;
  end if;

  if new.entity_type = 'purchase_note' then
    receipt_qty := coalesce((new.data->>'qty')::numeric, 0);
    unit_cost := coalesce((new.data->>'unitCost')::numeric, -1);

    if receipt_qty <= 0 then
      raise exception 'A quantidade recebida deve ser maior que zero.'
        using errcode = '22023';
    end if;

    if unit_cost < 0 then
      raise exception 'O custo do recebimento nao pode ser negativo.'
        using errcode = '22023';
    end if;

    if length(btrim(coalesce(new.data->>'number', ''))) = 0 then
      raise exception 'Informe a nota ou comprovante do recebimento.'
        using errcode = '22023';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists erp_records_validate_purchase_record on public.erp_records;
create trigger erp_records_validate_purchase_record
before insert or update on public.erp_records
for each row execute function public.erp_validate_purchase_record();
