begin;

update public.macaroca_app_state
set state = jsonb_set(
      state,
      '{users}',
      coalesce(
        (
          select jsonb_agg(
            jsonb_set(legacy_user, '{password}', '""'::jsonb, true)
          )
          from jsonb_array_elements(state->'users') legacy_user
        ),
        '[]'::jsonb
      )
    ),
    updated_at = now()
where id = 'main';

update public.macaroca_app_state_test
set state = jsonb_set(
      state,
      '{users}',
      coalesce(
        (
          select jsonb_agg(
            jsonb_set(legacy_user, '{password}', '""'::jsonb, true)
          )
          from jsonb_array_elements(state->'users') legacy_user
        ),
        '[]'::jsonb
      )
    ),
    updated_at = now()
where id = 'main';

revoke all on table public.macaroca_app_state from anon, authenticated;
revoke all on table public.macaroca_app_state_test from anon, authenticated;

commit;

-- A restauração de emergência deve usar o backup completo protegido criado
-- antes desta finalização e reativar apenas as permissões necessárias.
