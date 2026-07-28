-- Etapa 4: valida o ciclo comercial sem alterar pedidos antigos.
-- As regras se aplicam aos registros novos que usam os campos desta etapa.

create or replace function public.erp_validate_order_sales_flow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  document_type text := new.data->>'documentType';
  order_status text := new.data->>'status';
  reservation_status text := new.data->>'reservationStatus';
  cancellation_reason text := btrim(coalesce(new.data->>'cancellationReason', ''));
begin
  if new.entity_type <> 'order' then
    return new;
  end if;

  if document_type = 'Orçamento' and reservation_status = 'Reservado' then
    raise exception 'Orcamentos nao podem reservar estoque.'
      using errcode = '22023';
  end if;

  if order_status = 'Cancelado'
    and new.data ? 'reservationStatus'
    and reservation_status <> 'Liberado' then
    raise exception 'O cancelamento deve liberar a reserva de estoque.'
      using errcode = '22023';
  end if;

  if order_status = 'Cancelado'
    and new.data ? 'cancellationReason'
    and char_length(cancellation_reason) < 3 then
    raise exception 'Informe a justificativa do cancelamento.'
      using errcode = '22023';
  end if;

  if document_type = 'Pedido'
    and reservation_status = 'Reservado'
    and not (new.data ? 'availabilityCheckedAt') then
    raise exception 'Verifique a disponibilidade antes de reservar o pedido.'
      using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists erp_records_validate_order_sales_flow on public.erp_records;
create trigger erp_records_validate_order_sales_flow
before insert or update on public.erp_records
for each row execute function public.erp_validate_order_sales_flow();
