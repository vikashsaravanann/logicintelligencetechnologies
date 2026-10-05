-- Run against an isolated PostgreSQL fixture, never the production database.
-- Fixture columns/policies are reconstructed from live metadata, not user rows.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO public.profiles(id, role) VALUES
 ('11111111-1111-4111-8111-111111111111', 'client'),
 ('22222222-2222-4222-8222-222222222222', 'client'),
 ('33333333-3333-4333-8333-333333333333', 'admin');
INSERT INTO public.projects(id,user_id) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',NULL);
INSERT INTO public.invoices(id,user_id) SELECT id,user_id FROM public.projects;
INSERT INTO public.bookings(id,user_id,email) SELECT id,user_id,'same@example.test' FROM public.projects;
INSERT INTO public.support_tickets(id,user_id,subject,message,status) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','One','Test','Open'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','Two','Test','Open');
INSERT INTO public.support_ticket_messages(ticket_id,sender_id,sender_type,sender_name,message) VALUES
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','client','Two','Private');
INSERT INTO storage.objects(bucket_id,name) VALUES
 ('client_vault','11111111-1111-4111-8111-111111111111/test.pdf'),
 ('client_vault','22222222-2222-4222-8222-222222222222/test.pdf');
INSERT INTO public.client_files(user_id,file_name,file_path,size) VALUES
 ('22222222-2222-4222-8222-222222222222','test.pdf','22222222-2222-4222-8222-222222222222/test.pdf',100);
INSERT INTO public.onboarding_submissions(user_id,answers_json,status) VALUES
 ('22222222-2222-4222-8222-222222222222','{}','Submitted');
INSERT INTO public.contact_leads(id,email) VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','private@example.test');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","email":"same@example.test","is_anonymous":false}',true);
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM public.projects; IF n <> 1 THEN RAISE EXCEPTION 'project isolation failed'; END IF;
  SELECT count(*) INTO n FROM public.invoices; IF n <> 1 THEN RAISE EXCEPTION 'invoice isolation failed'; END IF;
  SELECT count(*) INTO n FROM public.bookings; IF n <> 1 THEN RAISE EXCEPTION 'booking email/NULL isolation failed'; END IF;
  SELECT count(*) INTO n FROM public.support_tickets; IF n <> 1 THEN RAISE EXCEPTION 'ticket isolation failed'; END IF;
  SELECT count(*) INTO n FROM public.support_ticket_messages; IF n <> 0 THEN RAISE EXCEPTION 'message isolation failed'; END IF;
  SELECT count(*) INTO n FROM public.client_files; IF n <> 0 THEN RAISE EXCEPTION 'file isolation failed'; END IF;
  SELECT count(*) INTO n FROM public.onboarding_submissions; IF n <> 0 THEN RAISE EXCEPTION 'onboarding isolation failed'; END IF;
  SELECT count(*) INTO n FROM public.contact_leads; IF n <> 0 THEN RAISE EXCEPTION 'lead privacy failed'; END IF;
  SELECT count(*) INTO n FROM storage.objects; IF n <> 1 THEN RAISE EXCEPTION 'vault isolation failed'; END IF;
  UPDATE public.projects SET user_id = '22222222-2222-4222-8222-222222222222';
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 0 THEN RAISE EXCEPTION 'client project update allowed'; END IF;
  UPDATE public.support_tickets SET status = 'Resolved';
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 0 THEN RAISE EXCEPTION 'client status update allowed'; END IF;
  BEGIN
    UPDATE public.profiles SET role = 'admin' WHERE id = '11111111-1111-4111-8111-111111111111';
    RAISE EXCEPTION 'self-promotion allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.support_ticket_messages(ticket_id,sender_id,sender_type,sender_name,message)
      VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','admin','Staff','Fake');
    RAISE EXCEPTION 'staff impersonation allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.support_ticket_messages(ticket_id,sender_id,sender_type,sender_name,message)
      VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','11111111-1111-4111-8111-111111111111','client','One','Fake');
    RAISE EXCEPTION 'cross-tenant message insert allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.client_files(user_id,file_name,file_path,size)
      VALUES ('11111111-1111-4111-8111-111111111111','test.pdf','22222222-2222-4222-8222-222222222222/test.pdf',100);
    RAISE EXCEPTION 'foreign file path allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.client_files(user_id,file_name,file_path,size)
      VALUES ('11111111-1111-4111-8111-111111111111','missing.pdf','11111111-1111-4111-8111-111111111111/missing.pdf',100);
    RAISE EXCEPTION 'nonexistent file metadata allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.contact_leads(email) VALUES ('spam@example.test');
    RAISE EXCEPTION 'direct lead insert allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO storage.objects(bucket_id,name) VALUES ('client_vault','22222222-2222-4222-8222-222222222222/foreign.pdf');
    RAISE EXCEPTION 'cross-tenant upload allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  INSERT INTO public.support_ticket_messages(ticket_id,sender_id,sender_type,sender_name,message)
    VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','client','One','Legitimate');
  INSERT INTO public.client_files(user_id,file_name,file_path,size)
    VALUES ('11111111-1111-4111-8111-111111111111','test.pdf','11111111-1111-4111-8111-111111111111/test.pdf',100);
  INSERT INTO public.onboarding_submissions(user_id,answers_json,status)
    VALUES ('11111111-1111-4111-8111-111111111111','{}','Submitted');
END $$;

-- Even a registered company-domain address does not confer admin rights.
SELECT set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","email":"unprivileged@logicintelligencetechnologies.in"}',true);
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.contact_leads) THEN RAISE EXCEPTION 'email-suffix escalation'; END IF;
END $$;
-- Anonymous sign-in carries authenticated role but must not access client data.
SELECT set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","is_anonymous":true}',true);
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.projects) OR EXISTS (SELECT 1 FROM storage.objects) THEN RAISE EXCEPTION 'anonymous sign-in access'; END IF;
END $$;
SELECT set_config('request.jwt.claims','{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated","is_anonymous":false}',true);
DO $$ DECLARE n int; BEGIN
 SELECT count(*) INTO n FROM public.projects; IF n <> 3 THEN RAISE EXCEPTION 'admin read failed'; END IF;
 SELECT count(*) INTO n FROM public.contact_leads; IF n <> 1 THEN RAISE EXCEPTION 'admin lead read failed'; END IF;
 SELECT count(*) INTO n FROM storage.objects; IF n <> 2 THEN RAISE EXCEPTION 'admin vault read failed'; END IF;
END $$;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims','{"role":"anon"}',true);
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.projects) OR EXISTS (SELECT 1 FROM public.contact_leads) THEN RAISE EXCEPTION 'anon read allowed'; END IF;
 BEGIN
  INSERT INTO public.bookings(email) VALUES ('spam@example.test');
  RAISE EXCEPTION 'anon direct booking insert allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SET LOCAL ROLE service_role;
DO $$ DECLARE n int; BEGIN
 SELECT count(*) INTO n FROM public.projects; IF n <> 3 THEN RAISE EXCEPTION 'server access failed'; END IF;
END $$;
ROLLBACK;
\echo 'PASS: tenant, NULL, email, anonymous, role, sender, path, status and server access checks'