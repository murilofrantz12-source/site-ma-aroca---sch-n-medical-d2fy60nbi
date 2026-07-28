-- Etapa 9: protege lancamentos financeiros e datas de realizacao.

create or replace function public.erp_validate_finance_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text := public.erp_current_role();
  entry_kind text;
  entry_category text;
  entry_source text;
  entry_value numeric;
  is_paid boolean;
  paid_at text;
begin
  if new.entity_type <> 'cash_entry' then
    return new;
  end if;

  entry_kind := coalesce(new.data->>'kind', '');
  entry_category := coalesce(new.data->>'category', '');
  entry_source := coalesce(new.data->>'source', '');
  entry_value := coalesce((new.data->>'value')::numeric, -1);
  is_paid := coalesce((new.data->>'paid')::boolean, false);
  paid_at := btrim(coalesce(new.data->>'paidAt', ''));

  if actor_role not in ('Admin', 'Financeiro') then
    if tg_op <> 'INSERT'
      or entry_category <> 'Venda recebida'
      or entry_kind <> 'Entrada'
      or entry_source not like 'PED-%' then
      raise exception 'Somente Administracao ou Financeiro pode alterar pagamentos e despesas.'
        using errcode = '42501';
    end if;
  end if;

  if entry_kind not in ('Entrada', 'Saída') then
    raise exception 'O lancamento deve ser uma entrada ou uma saida.'
      using errcode = '22023';
  end if;

  if entry_category not in (
    'Venda recebida',
    'Conta a pagar',
    'Compra de matéria-prima',
    'Despesa fixa',
    'Comissão',
    'Outro'
  ) then
    raise exception 'Categoria financeira invalida.'
      using errcode = '22023';
  end if;

  if entry_value < 0 then
    raise exception 'O valor do lancamento nao pode ser negativo.'
      using errcode = '22023';
  end if;

  if length(btrim(coalesce(new.data->>'description', ''))) = 0 then
    raise exception 'A descricao do lancamento financeiro e obrigatoria.'
      using errcode = '22023';
  end if;

  if is_paid and length(paid_at) = 0 then
    raise exception 'Informe quando o pagamento ou recebimento aconteceu.'
      using errcode = '22023';
  end if;

  if not is_paid and length(paid_at) > 0 then
    raise exception 'Um lancamento pendente nao pode ter data de realizacao.'
      using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists erp_records_validate_finance_record on public.erp_records;
create trigger erp_records_validate_finance_record
before insert or update on public.erp_records
for each row execute function public.erp_validate_finance_record();
