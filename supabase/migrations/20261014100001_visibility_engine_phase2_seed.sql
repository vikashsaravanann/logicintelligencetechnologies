-- 20261014100001_visibility_engine_phase2_seed.sql
-- LIT Visibility Engine — Phase 2 seed: all 4 LIT products as tracked entities,
-- with researched buyer queries and genuinely comparable competitors.
--
-- Idempotent: entities upsert on their (unique) domain; queries guard on
-- (entity_id, query_text); competitors upsert on (entity_id, domain). Safe to
-- run repeatedly. Queries are grounded in each product's repo/README content
-- (see Phase 2 build notes), not invented.
--
-- Entity domains are stored bare (no scheme/www) so they match the hostnames
-- the probe records. The company keeps the Phase 1 value so this does not
-- create a second company row.

-- ---------------------------------------------------------------------------
-- Entities (upsert on domain)
-- ---------------------------------------------------------------------------
insert into tracked_entities (name, type, domain) values
  ('Logic Intelligence Technologies', 'self', 'logicintelligencetechnologies.in'),
  ('LIT Smart Hospital Platform',     'self', 'healthcare.logicintelligencetechnologies.in'),
  ('Logic Voice',                     'self', 'logicvoice.logicintelligencetechnologies.in'),
  ('Voice Shield',                    'self', 'voiceshield.logicintelligencetechnologies.in')
on conflict (domain) do update set name = excluded.name, type = excluded.type;

-- ---------------------------------------------------------------------------
-- Target queries (buyer searches; branded + non-branded; en-IN)
-- ---------------------------------------------------------------------------
insert into target_queries (entity_id, query_text, locale)
select e.id, q.query_text, 'en-IN'
from tracked_entities e
join (values
  -- Company (software / web / AI SaaS development, Coimbatore / India)
  ('logicintelligencetechnologies.in', 'Logic Intelligence Technologies reviews'),
  -- Smart Hospital Platform (multi-tenant HMS, EMR, clinical intelligence; India)
  ('healthcare.logicintelligencetechnologies.in', 'hospital management software India'),
  ('healthcare.logicintelligencetechnologies.in', 'cloud HMS for multi-specialty hospitals India'),
  ('healthcare.logicintelligencetechnologies.in', 'ABDM compliant hospital management system'),
  ('healthcare.logicintelligencetechnologies.in', 'best EMR software for hospitals India'),
  ('healthcare.logicintelligencetechnologies.in', 'hospital bed management and clinical intelligence software'),
  ('healthcare.logicintelligencetechnologies.in', 'LIT Smart Hospital Platform'),
  -- Logic Voice (local-first personal AI voice assistant with a policy engine)
  ('logicvoice.logicintelligencetechnologies.in', 'local-first AI voice assistant'),
  ('logicvoice.logicintelligencetechnologies.in', 'privacy focused personal AI assistant'),
  ('logicvoice.logicintelligencetechnologies.in', 'AI voice assistant with policy controls'),
  ('logicvoice.logicintelligencetechnologies.in', 'offline voice assistant for business India'),
  ('logicvoice.logicintelligencetechnologies.in', 'Logic Voice assistant'),
  ('logicvoice.logicintelligencetechnologies.in', 'Logic Voice pricing'),
  -- Voice Shield (real-time voice-clone / deepfake detection; anti-spoofing)
  ('voiceshield.logicintelligencetechnologies.in', 'real-time voice deepfake detection software'),
  ('voiceshield.logicintelligencetechnologies.in', 'voice cloning detection API'),
  ('voiceshield.logicintelligencetechnologies.in', 'deepfake audio detection for call centers'),
  ('voiceshield.logicintelligencetechnologies.in', 'detect AI generated voice in phone calls'),
  ('voiceshield.logicintelligencetechnologies.in', 'VoiceShield deepfake detection'),
  ('voiceshield.logicintelligencetechnologies.in', 'anti-spoofing voice detection India')
) as q(entity_domain, query_text) on q.entity_domain = e.domain
where not exists (
  select 1 from target_queries tq where tq.entity_id = e.id and tq.query_text = q.query_text
);

-- ---------------------------------------------------------------------------
-- Competitors (only where confidently comparable; upsert on entity+domain)
--
-- NOTE: Logic Voice has NO competitors seeded on purpose. It is a local-first
-- personal AI voice assistant (policy engine, mock LLMs, owner-gated) rather
-- than a product in a clearly contested commercial category, so there is no set
-- of directly comparable vendors we can identify with confidence. Per the build
-- spec we leave it empty rather than invent competitors; add them later once
-- the positioning is settled.
-- ---------------------------------------------------------------------------
insert into competitors (entity_id, name, domain)
select e.id, c.name, c.domain
from tracked_entities e
join (values
  -- Company: recurring Coimbatore web/software development firms
  ('logicintelligencetechnologies.in', 'ColorWhistle',     'colorwhistle.com'),
  ('logicintelligencetechnologies.in', 'ProPlus Logics',   'propluslogics.com'),
  -- Smart Hospital: established Indian HMS/cloud-HMS vendors
  ('healthcare.logicintelligencetechnologies.in', 'MocDoc',    'mocdoc.com'),
  ('healthcare.logicintelligencetechnologies.in', 'KareXpert', 'karexpert.com'),
  ('healthcare.logicintelligencetechnologies.in', 'Practo',    'practo.com'),
  -- Voice Shield: voice deepfake / anti-spoofing detection vendors
  ('voiceshield.logicintelligencetechnologies.in', 'Pindrop',          'pindrop.com'),
  ('voiceshield.logicintelligencetechnologies.in', 'Reality Defender', 'realitydefender.com'),
  ('voiceshield.logicintelligencetechnologies.in', 'Resemble AI',      'resemble.ai')
) as c(entity_domain, name, domain) on c.entity_domain = e.domain
on conflict (entity_id, domain) do nothing;
