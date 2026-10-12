-- 20261012110000_normalize_outreach_policies.sql
-- LIT Global Outreach Compliance System — Policy Normalization & Deduplication Migration
--
-- Objectives:
--   1. Cleanly deduplicate existing rows in outreach_policy_rules, preserving foreign key integrity.
--   2. Add deterministic rule_key and is_current columns with auto-computation trigger.
--   3. Create composite unique index idx_outreach_policy_rules_scope_version and idx_outreach_policy_rules_key.
--   4. Enhance outreach_policy_approvals with reviewer qualifications, evidence hashes, scope limitations, and dual signoff.
--   5. Enhance outreach_eligibility_decisions with policy fingerprints, effective rule/approval references, and evaluation metadata.
--   6. Reconcile database triggers: specific-over-broad precedence (macro allowlist never overrides a specific rule).
--   7. Upsert the authoritative 8 macro country rules + 1 controlled India B2B pilot scenario without duplication.
--   8. Service-role-only RLS re-verification.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Add schema columns if not existing
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS outreach_policy_rules
  ADD COLUMN IF NOT EXISTS rule_key text,
  ADD COLUMN IF NOT EXISTS is_current boolean NOT NULL DEFAULT true;

-- ---------------------------------------------------------------------------
-- 2. Deduplicate existing records in outreach_policy_rules cleanly
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
  kept_id uuid;
  dup_ids uuid[];
BEGIN
  FOR r IN
    SELECT country_code, COALESCE(region, '') AS reg, channel, recipient_class, purpose, rule_version
    FROM outreach_policy_rules
    GROUP BY country_code, COALESCE(region, ''), channel, recipient_class, purpose, rule_version
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the primary record with the latest update/creation
    SELECT id INTO kept_id
    FROM outreach_policy_rules
    WHERE country_code = r.country_code
      AND COALESCE(region, '') = r.reg
      AND channel = r.channel
      AND recipient_class = r.recipient_class
      AND purpose = r.purpose
      AND rule_version = r.rule_version
    ORDER BY updated_at DESC, created_at DESC, id DESC
    LIMIT 1;

    -- Collect duplicate IDs to merge
    SELECT array_agg(id) INTO dup_ids
    FROM outreach_policy_rules
    WHERE country_code = r.country_code
      AND COALESCE(region, '') = r.reg
      AND channel = r.channel
      AND recipient_class = r.recipient_class
      AND purpose = r.purpose
      AND rule_version = r.rule_version
      AND id <> kept_id;

    IF dup_ids IS NOT NULL AND array_length(dup_ids, 1) > 0 THEN
      -- Re-point foreign keys in outreach_policy_approvals
      UPDATE outreach_policy_approvals
      SET rule_id = kept_id
      WHERE rule_id = ANY(dup_ids);

      -- Re-point foreign keys in outreach_eligibility_decisions
      UPDATE outreach_eligibility_decisions
      SET rule_id = kept_id
      WHERE rule_id = ANY(dup_ids);

      -- Delete duplicate records
      DELETE FROM outreach_policy_rules
      WHERE id = ANY(dup_ids);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Backfill rule_key and establish auto-generation trigger
-- ---------------------------------------------------------------------------
UPDATE outreach_policy_rules
SET rule_key = country_code || ':' || channel || ':' || recipient_class || ':' || purpose ||
               CASE WHEN region IS NOT NULL AND region <> '' THEN ':' || region ELSE '' END ||
               ':' || COALESCE(rule_version, '1.0')
WHERE rule_key IS NULL OR rule_key = '';

CREATE OR REPLACE FUNCTION outreach_compute_rule_key()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.rule_key IS NULL OR NEW.rule_key = '' THEN
    NEW.rule_key := NEW.country_code || ':' || NEW.channel || ':' || NEW.recipient_class || ':' || NEW.purpose ||
                    CASE WHEN NEW.region IS NOT NULL AND NEW.region <> '' THEN ':' || NEW.region ELSE '' END ||
                    ':' || COALESCE(NEW.rule_version, '1.0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_compute_rule_key ON outreach_policy_rules;
CREATE TRIGGER trg_compute_rule_key
  BEFORE INSERT OR UPDATE ON outreach_policy_rules
  FOR EACH ROW EXECUTE FUNCTION outreach_compute_rule_key();

-- ---------------------------------------------------------------------------
-- 4. Unique composite indexes to prevent duplicates forever
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_outreach_policy_rules_scope_version
  ON outreach_policy_rules (country_code, COALESCE(region, ''), channel, recipient_class, purpose, rule_version);

CREATE UNIQUE INDEX IF NOT EXISTS idx_outreach_policy_rules_key
  ON outreach_policy_rules (rule_key);

-- ---------------------------------------------------------------------------
-- 5. Enhanced outreach_policy_approvals columns
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS outreach_policy_approvals
  ADD COLUMN IF NOT EXISTS reviewer_qualification text,
  ADD COLUMN IF NOT EXISTS evidence_hash text,
  ADD COLUMN IF NOT EXISTS scope_limitations jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS dual_signoff_by text,
  ADD COLUMN IF NOT EXISTS dual_signoff_at timestamptz,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_outreach_approvals_status'
  ) THEN
    ALTER TABLE outreach_policy_approvals
      ADD CONSTRAINT chk_outreach_approvals_status
      CHECK (status IN ('active', 'expired', 'revoked', 'superseded'));
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 6. Enhanced outreach_eligibility_decisions columns
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS outreach_eligibility_decisions
  ADD COLUMN IF NOT EXISTS policy_fingerprint text,
  ADD COLUMN IF NOT EXISTS effective_rule_id uuid REFERENCES outreach_policy_rules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS effective_approval_id uuid REFERENCES outreach_policy_approvals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS evaluated_purpose text,
  ADD COLUMN IF NOT EXISTS evaluated_channel text;

CREATE INDEX IF NOT EXISTS idx_decisions_effective_rule
  ON outreach_eligibility_decisions (effective_rule_id);
CREATE INDEX IF NOT EXISTS idx_decisions_effective_approval
  ON outreach_eligibility_decisions (effective_approval_id);

-- ---------------------------------------------------------------------------
-- 7. Reconcile Database Triggers (Specific-Over-Broad Precedence)
-- ---------------------------------------------------------------------------

-- 7.1 Gate on lead_outreach
CREATE OR REPLACE FUNCTION lead_enforce_outreach_gates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_country       text;
  v_status        jurisdiction_outreach_status;
  v_rule_status   text;
  v_email         text;
  v_phone         text;
  v_domain        text;
BEGIN
  SELECT country_code, domain INTO v_country, v_domain
    FROM lead_businesses WHERE id = NEW.business_id;

  IF v_country IS NULL THEN
    RAISE EXCEPTION
      'Outreach blocked: business % has no country_code; cannot clear jurisdiction', NEW.business_id;
  END IF;

  -- 1. Check for specific granular policy rules for this country and channel.
  -- Specific-over-broad precedence: A specific rule always takes precedence.
  SELECT policy_status INTO v_rule_status
    FROM outreach_policy_rules
   WHERE country_code = v_country
     AND channel = NEW.channel::text
     AND is_current = true
     AND (expires_at IS NULL OR expires_at > now())
   ORDER BY (region IS NOT NULL AND region <> '') DESC, updated_at DESC
   LIMIT 1;

  IF v_rule_status IS NOT NULL THEN
    IF v_rule_status <> 'permitted' THEN
      RAISE EXCEPTION
        'Outreach blocked: jurisdiction % rule status is % for % channel',
        v_country, v_rule_status, NEW.channel;
    END IF;
  ELSE
    -- No specific rule registered: check macro country allowlist
    SELECT outreach_status INTO v_status
      FROM lead_jurisdictions WHERE country_code = v_country;

    IF v_status IS DISTINCT FROM 'allowed' THEN
      RAISE EXCEPTION
        'Outreach blocked: jurisdiction % is not on the outreach allowlist (status: %)',
        v_country, COALESCE(v_status::text, 'unlisted');
    END IF;
  END IF;

  IF NEW.contact_id IS NOT NULL THEN
    SELECT email, phone INTO v_email, v_phone
      FROM lead_contacts WHERE id = NEW.contact_id;
  END IF;

  -- Dual suppression check
  IF EXISTS (
    SELECT 1 FROM lead_suppressions s
     WHERE s.active
       AND (
            s.business_id = NEW.business_id
         OR (v_email  IS NOT NULL AND lower(s.email)  = lower(v_email))
         OR (v_phone  IS NOT NULL AND s.phone         = v_phone)
         OR (v_domain IS NOT NULL AND lower(s.domain) = lower(v_domain))
       )
  ) OR (
    v_email IS NOT NULL AND EXISTS (
      SELECT 1 FROM email_suppressions es
       WHERE lower(es.email) = lower(v_email)
    )
  ) THEN
    RAISE EXCEPTION
      'Outreach blocked: active suppression exists for business % / contact %',
      NEW.business_id, NEW.contact_id;
  END IF;

  NEW.jurisdiction_cleared := true;
  NEW.suppression_checked  := true;
  RETURN NEW;
END;
$$;

-- 7.2 Gate on lead_outreach_messages (Message Studio)
CREATE OR REPLACE FUNCTION lead_enforce_outreach_message_gate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_country     text;
  v_status      jurisdiction_outreach_status;
  v_rule_status text;
  v_domain      text;
BEGIN
  -- Only gate approved, scheduled, or sent states
  IF NEW.status IN ('approved', 'scheduled', 'sent') THEN
    IF NOT NEW.blockers_pass THEN
      RAISE EXCEPTION 'Message approval blocked: QA blocker gates have not passed';
    END IF;

    SELECT country_code, domain INTO v_country, v_domain
      FROM lead_businesses WHERE id = NEW.business_id;

    IF v_country IS NULL THEN
      RAISE EXCEPTION 'Message approval blocked: business % has no country_code', NEW.business_id;
    END IF;

    -- Specific rule check with specific-over-broad precedence
    SELECT policy_status INTO v_rule_status
      FROM outreach_policy_rules
     WHERE country_code = v_country
       AND channel = NEW.channel::text
       AND is_current = true
       AND (expires_at IS NULL OR expires_at > now())
     ORDER BY (region IS NOT NULL AND region <> '') DESC, updated_at DESC
     LIMIT 1;

    IF v_rule_status IS NOT NULL THEN
      IF v_rule_status <> 'permitted' THEN
        RAISE EXCEPTION
          'Message approval blocked: jurisdiction % rule status is % for % channel',
          v_country, v_rule_status, NEW.channel;
      END IF;
    ELSE
      SELECT outreach_status INTO v_status
        FROM lead_jurisdictions WHERE country_code = v_country;

      IF v_status IS DISTINCT FROM 'allowed' THEN
        RAISE EXCEPTION
          'Message approval blocked: jurisdiction % is not permitted (status: %)',
          v_country, COALESCE(v_status::text, 'unlisted');
      END IF;
    END IF;

    -- Check suppression
    IF EXISTS (
      SELECT 1 FROM lead_suppressions s
       WHERE s.active
         AND (s.business_id = NEW.business_id OR (v_domain IS NOT NULL AND lower(s.domain) = lower(v_domain)))
    ) THEN
      RAISE EXCEPTION 'Message approval blocked: active suppression exists for business %', NEW.business_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 8. Seed & Reconcile Authoritative Core Rules (8 macro + 1 India pilot)
-- ---------------------------------------------------------------------------
INSERT INTO outreach_policy_rules (
  country_code, region, channel, recipient_class, purpose, policy_status, requires_consent, rule_version, official_source_urls, notes
) VALUES
  ('US', NULL, 'email', 'corporate_subscriber', 'cold_outreach', 'review_required', false, '1.0',
   ARRAY['https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business'],
   'US B2B Email: CAN-SPAM opt-out regime. Physical postal address + one-click opt-out mandatory. Needs human legal signoff.'),

  ('GB', NULL, 'email', 'corporate_subscriber', 'cold_outreach', 'review_required', false, '1.0',
   ARRAY['https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/'],
   'UK B2B Email: PECR Reg 22 corporate exception. Requires verified corporate status and documented LIA under UK GDPR Art 6(1)(f).'),

  ('IN', NULL, 'email', 'corporate_subscriber', 'cold_outreach', 'review_required', false, '1.0',
   ARRAY['https://www.trai.gov.in/advice-to-senders'],
   'India Macro Baseline: DPDP Act 2023. General cold outreach requires documented human review, verified opt-out and clear sender identity.'),

  ('IN', NULL, 'email', 'corporate_subscriber', 'b2b_pilot_demonstration', 'review_required', false, '1.0-pilot',
   ARRAY['https://www.meity.gov.in/content/digital-personal-data-protection-act-2023'],
   'India Controlled Pilot: B2B demonstration outreach under DPDP Act 2023 with verified corporate domains and designated DPO contact.'),

  ('DE', NULL, 'email', 'corporate_subscriber', 'cold_outreach', 'restricted', true, '1.0',
   ARRAY['https://www.gesetze-im-internet.de/uwg_2004/BJNR141400004.html'],
   'Germany: Section 7 UWG prohibits electronic B2B marketing without prior express consent.'),

  ('FR', NULL, 'email', 'corporate_subscriber', 'cold_outreach', 'review_required', false, '1.0',
   ARRAY['https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique-sms-mms-et-automate-dappel'],
   'France B2B Email: CNIL professional exception requires direct subject relevance and clear opt-out.'),

  ('CA', NULL, 'email', 'corporate_subscriber', 'cold_outreach', 'restricted', true, '1.0',
   ARRAY['https://crtc.gc.ca/eng/com500/guide.htm'],
   'Canada: CASL strict opt-in regime. Conspicuous publication or express consent required.'),

  ('AU', NULL, 'email', 'corporate_subscriber', 'cold_outreach', 'review_required', false, '1.0',
   ARRAY['https://www.acma.gov.au/avoid-sending-spam'],
   'Australia: Spam Act 2003 consent regime. Conspicuous publication inferred consent requires direct work relevance.'),

  ('AE', NULL, 'email', 'corporate_subscriber', 'cold_outreach', 'review_required', false, '1.0',
   ARRAY['https://tdra.gov.ae/'],
   'UAE: UAE PDPL & commercial communication framework. Commercial identification and opt-out required.')
ON CONFLICT (country_code, COALESCE(region, ''), channel, recipient_class, purpose, rule_version)
DO UPDATE SET
  policy_status = EXCLUDED.policy_status,
  requires_consent = EXCLUDED.requires_consent,
  official_source_urls = EXCLUDED.official_source_urls,
  notes = EXCLUDED.notes,
  is_current = true,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 9. Re-verify Service Role Security
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'outreach_policy_rules',
    'outreach_policy_approvals',
    'outreach_consent_evidence',
    'outreach_eligibility_decisions',
    'outreach_delivery_events'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS service_role_all ON %I;', t);
    EXECUTE format('CREATE POLICY service_role_all ON %I FOR ALL TO service_role USING (true) WITH CHECK (true);', t);
    EXECUTE format('REVOKE ALL ON %I FROM public, anon, authenticated;', t);
    EXECUTE format('GRANT ALL ON %I TO service_role;', t);
  END LOOP;
END $$;

COMMIT;
