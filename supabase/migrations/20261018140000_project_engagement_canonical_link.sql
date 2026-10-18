-- Canonical link: Client Portal projects ↔ client_engagements
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS engagement_id uuid REFERENCES public.client_engagements(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_engagement_id ON public.projects(engagement_id);

-- Unique when set (one portal project per engagement when mapped)
CREATE UNIQUE INDEX IF NOT EXISTS uq_projects_engagement_id
  ON public.projects(engagement_id)
  WHERE engagement_id IS NOT NULL;

-- Optional metadata on threads for engagement UUID
COMMENT ON COLUMN public.projects.engagement_id IS
  'Canonical client_engagements.id for staff assignment and messaging scope';
