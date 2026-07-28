-- Etapa 3: protege a negociacao de preco e a aprovacao de descontos criticos.
-- O frontend calcula e registra a fotografia do preco dentro do proprio pedido.

create or replace function public.erp_validate_order_pricing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text := public.erp_current_role();
  old_pricing jsonb := case when tg_op = 'UPDATE' then old.data->'pricing' else null end;
  new_pricing jsonb := new.data->'pricing';
  old_approval text := old_pricing->>'approvalStatus';
  new_approval text := new_pricing->>'approvalStatus';
  negotiated_price numeric;
  minimum_price numeric;
  order_unit_price numeric;
begin
  if new.entity_type <> 'order' or new_pricing is null then
    return new;
  end if;

  negotiated_price := coalesce((new_pricing->>'negotiatedPrice')::numeric, 0);
  minimum_price := coalesce((new_pricing->>'minimumPrice')::numeric, 0);
  order_unit_price := coalesce((new.data->>'unitPrice')::numeric, 0);

  if abs(order_unit_price - negotiated_price) > 0.01 then
    raise exception 'O preco negociado do pedido esta inconsistente.'
      using errcode = '22023';
  end if;

  if negotiated_price + 0.01 < minimum_price
    and coalesce(new_approval, '') not in ('Pendente', 'Aprovada') then
    raise exception 'Preco abaixo do minimo exige aprovacao administrativa.'
      using errcode = '42501';
  end if;

  if actor_role <> 'Admin' then
    if new_approval in ('Aprovada', 'Recusada')
      and (
        tg_op = 'INSERT'
        or old_approval is distinct from new_approval
        or old_pricing is distinct from new_pricing
      ) then
      raise exception 'Somente o administrador pode aprovar ou recusar descontos criticos.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists erp_records_validate_order_pricing on public.erp_records;
create trigger erp_records_validate_order_pricing
before insert or update on public.erp_records
for each row execute function public.erp_validate_order_pricing();
