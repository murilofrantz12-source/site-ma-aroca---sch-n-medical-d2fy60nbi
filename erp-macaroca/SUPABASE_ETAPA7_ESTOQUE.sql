-- Etapa 7: protege movimentacoes, ajustes e contagens de estoque.
-- Compras, producao e entregas continuam permitidas conforme as permissoes gerais.

create or replace function public.erp_validate_inventory_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text := public.erp_current_role();
  movement_kind text := coalesce(new.data->>'kind', '');
  movement_qty numeric := coalesce((new.data->>'qty')::numeric, 0);
  movement_reason text := btrim(coalesce(new.data->>'reason', ''));
  system_qty numeric;
  counted_qty numeric;
  recorded_difference numeric;
begin
  if new.entity_type = 'inventory_entry' then
    if movement_kind not in (
      'Entrada MP',
      'Consumo MP',
      'Entrada PA',
      'Saída PA',
      'Ajuste entrada MP',
      'Ajuste saída MP',
      'Ajuste entrada PA',
      'Ajuste saída PA'
    ) then
      raise exception 'Tipo de movimentacao de estoque invalido.'
        using errcode = '22023';
    end if;

    if movement_qty <= 0 then
      raise exception 'A quantidade movimentada deve ser maior que zero.'
        using errcode = '22023';
    end if;

    if movement_kind like 'Ajuste %' then
      if actor_role <> 'Admin' then
        raise exception 'Somente o perfil Admin pode ajustar o estoque.'
          using errcode = '42501';
      end if;

      if length(movement_reason) = 0 then
        raise exception 'A justificativa do ajuste e obrigatoria.'
          using errcode = '22023';
      end if;
    end if;
  end if;

  if new.entity_type = 'inventory_count' then
    if actor_role <> 'Admin' then
      raise exception 'Somente o perfil Admin pode concluir uma contagem fisica.'
        using errcode = '42501';
    end if;

    system_qty := coalesce((new.data->>'systemQty')::numeric, 0);
    counted_qty := coalesce((new.data->>'countedQty')::numeric, -1);
    recorded_difference := coalesce((new.data->>'difference')::numeric, 0);

    if counted_qty < 0 then
      raise exception 'A quantidade contada nao pode ser negativa.'
        using errcode = '22023';
    end if;

    if recorded_difference <> counted_qty - system_qty then
      raise exception 'A diferenca do inventario nao confere com a contagem.'
        using errcode = '22023';
    end if;

    if recorded_difference <> 0 and length(btrim(coalesce(new.data->>'notes', ''))) = 0 then
      raise exception 'Explique a diferenca encontrada no inventario.'
        using errcode = '22023';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists erp_records_validate_inventory_record on public.erp_records;
create trigger erp_records_validate_inventory_record
before insert or update on public.erp_records
for each row execute function public.erp_validate_inventory_record();
