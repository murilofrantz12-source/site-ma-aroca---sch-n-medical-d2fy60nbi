-- Etapa 2: permite que o perfil Socia crie e mantenha produtos e fichas.
-- Exclusoes continuam restritas ao Admin pela regra geral de erp_can.

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
      return requested_entity in (
        'customer', 'product', 'order', 'production_order', 'inventory_entry'
      );
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

-- Completa os materiais antigos sem apagar nenhum campo existente.
update public.erp_records
set data = data || jsonb_build_object(
  'stockLocation', coalesce(data->'stockLocation', '""'::jsonb),
  'expectedLoss', coalesce(data->'expectedLoss', '0'::jsonb)
)
where environment in ('production', 'test')
  and entity_type = 'raw_material'
  and (
    not data ? 'stockLocation'
    or not data ? 'expectedLoss'
  );

-- Mantem os produtos atuais ativos e suas fichas atuais aprovadas.
update public.erp_records product_record
set data = (
  product_record.data || jsonb_build_object(
    'referenceImage', coalesce(product_record.data->'referenceImage', '""'::jsonb),
    'active', coalesce(product_record.data->'active', 'true'::jsonb),
    'materials', coalesce((
      select jsonb_agg(material_item || jsonb_build_object(
        'expectedLoss', coalesce(material_item->'expectedLoss', '0'::jsonb)
      ))
      from jsonb_array_elements(coalesce(product_record.data->'materials', '[]'::jsonb)) material_item
    ), '[]'::jsonb),
    'variations', coalesce((
      select jsonb_agg(
        variation_item || jsonb_build_object(
          'model', coalesce(variation_item->'model', '""'::jsonb),
          'sheetVersion', coalesce(variation_item->'sheetVersion', '"v1"'::jsonb),
          'sheetResponsible', coalesce(variation_item->'sheetResponsible', '"Sistema"'::jsonb),
          'sheetStatus', coalesce(variation_item->'sheetStatus', '"Aprovada"'::jsonb),
          'materials', coalesce((
            select jsonb_agg(variation_material || jsonb_build_object(
              'expectedLoss', coalesce(variation_material->'expectedLoss', '0'::jsonb)
            ))
            from jsonb_array_elements(coalesce(variation_item->'materials', '[]'::jsonb)) variation_material
          ), '[]'::jsonb)
        )
      )
      from jsonb_array_elements(coalesce(product_record.data->'variations', '[]'::jsonb)) variation_item
    ), '[]'::jsonb)
  )
)
where product_record.environment in ('production', 'test')
  and product_record.entity_type = 'product';
