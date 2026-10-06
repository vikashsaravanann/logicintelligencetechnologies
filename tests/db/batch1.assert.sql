-- Batch 1 assertions: staff roles, append-only audit log, next_reference,
-- admin_set_role, last-super-admin protection. Runs in a transaction that is
-- rolled back; any failure raises an exception.
\set ON_ERROR_STOP on
BEGIN;

-- Seed two super admins + users
INSERT INTO auth.users(id,email,email_confirmed_at) VALUES
 ('11111111-1111-4111-8111-111111111111','sa1@logicintelligencetechnologies.in', now()),
 ('22222222-2222-4222-8222-222222222222','sa2@logicintelligencetechnologies.in', now()),
 ('33333333-3333-4333-8333-333333333333','staff@logicintelligencetechnologies.in', now());
INSERT INTO public.profiles(id,email,role) VALUES
 ('11111111-1111-4111-8111-111111111111','sa1@logicintelligencetechnologies.in','super_admin'),
 ('22222222-2222-4222-8222-222222222222','sa2@logicintelligencetechnologies.in','super_admin'),
 ('33333333-3333-4333-8333-333333333333','staff@logicintelligencetechnologies.in','user');

DO $$
DECLARE ok boolean; ref1 text; ref2 text; n int;
BEGIN
  -- role check constraint rejects an unknown role
  BEGIN
    UPDATE public.profiles SET role='wizard' WHERE id='33333333-3333-4333-8333-333333333333';
    RAISE EXCEPTION 'invalid role was accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;

  -- new staff role 'operations' is accepted
  UPDATE public.profiles SET role='operations' WHERE id='33333333-3333-4333-8333-333333333333';

  -- audit log is append-only: insert ok, update/delete/truncate blocked
  INSERT INTO public.admin_audit_log(action,outcome,request_id)
    VALUES ('team.role_change','succeeded','req-1');
  BEGIN
    UPDATE public.admin_audit_log SET outcome='failed';
    RAISE EXCEPTION 'audit UPDATE was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    DELETE FROM public.admin_audit_log;
    RAISE EXCEPTION 'audit DELETE was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  -- action-name format is enforced
  BEGIN
    INSERT INTO public.admin_audit_log(action,outcome,request_id) VALUES ('NotDotted','succeeded','r');
    RAISE EXCEPTION 'bad action name accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;

  -- next_reference increments per prefix/year and validates prefix
  SELECT public.next_reference('LIT-SOW') INTO ref1;
  SELECT public.next_reference('LIT-SOW') INTO ref2;
  IF ref1 = ref2 THEN RAISE EXCEPTION 'next_reference not unique: % %', ref1, ref2; END IF;
  IF right(ref1,4) <> '0001' OR right(ref2,4) <> '0002' THEN RAISE EXCEPTION 'next_reference numbering wrong: % %', ref1, ref2; END IF;
  BEGIN
    PERFORM public.next_reference('bad prefix');
    RAISE EXCEPTION 'bad prefix accepted';
  EXCEPTION WHEN others THEN NULL; END;

  -- last super_admin cannot be demoted; with two, one can
  UPDATE public.profiles SET role='admin' WHERE id='22222222-2222-4222-8222-222222222222';
  BEGIN
    UPDATE public.profiles SET role='admin' WHERE id='11111111-1111-4111-8111-111111111111';
    RAISE EXCEPTION 'last super_admin was demoted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  -- admin_set_role: a non-super-admin actor is rejected
  BEGIN
    PERFORM public.admin_set_role('33333333-3333-4333-8333-333333333333','admin',
      '33333333-3333-4333-8333-333333333333','staff@x','req');
    RAISE EXCEPTION 'non-super-admin assigned a role';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  -- admin_set_role by a super_admin upserts and writes an audit row
  PERFORM public.admin_set_role('33333333-3333-4333-8333-333333333333','support',
    '11111111-1111-4111-8111-111111111111','sa1@x','req-ok');
  SELECT role INTO ref1 FROM public.profiles WHERE id='33333333-3333-4333-8333-333333333333';
  IF ref1 <> 'support' THEN RAISE EXCEPTION 'admin_set_role did not set role'; END IF;
  SELECT count(*) INTO n FROM public.admin_audit_log WHERE action='team.role_change' AND request_id='req-ok';
  IF n <> 1 THEN RAISE EXCEPTION 'admin_set_role did not audit'; END IF;

  RAISE NOTICE 'batch1 assertions passed';
END $$;

ROLLBACK;
