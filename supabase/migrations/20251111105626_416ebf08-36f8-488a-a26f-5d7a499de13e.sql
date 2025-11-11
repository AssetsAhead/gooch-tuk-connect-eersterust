-- Create policy_updates table for tracking government legislation changes
CREATE TABLE public.policy_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  effective_date DATE,
  announcement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary TEXT NOT NULL,
  impact_level TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'announced',
  source_url TEXT,
  document_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.policy_updates ENABLE ROW LEVEL SECURITY;

-- Everyone can view policy updates
CREATE POLICY "Everyone can view policy updates"
ON public.policy_updates
FOR SELECT
TO authenticated
USING (true);

-- Admins and councillors can manage policy updates
CREATE POLICY "Admins and councillors can manage policy updates"
ON public.policy_updates
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'councillor')
      AND user_roles.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'councillor')
      AND user_roles.is_active = true
  )
);

-- Create index for faster queries
CREATE INDEX idx_policy_updates_category ON public.policy_updates(category);
CREATE INDEX idx_policy_updates_status ON public.policy_updates(status);
CREATE INDEX idx_policy_updates_effective_date ON public.policy_updates(effective_date);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_policy_updates_updated_at
BEFORE UPDATE ON public.policy_updates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial AARTO deferral record
INSERT INTO public.policy_updates (
  title,
  category,
  effective_date,
  announcement_date,
  summary,
  impact_level,
  status,
  source_url
) VALUES (
  'AARTO Implementation Deferred to July 1, 2026',
  'AARTO',
  '2026-07-01',
  '2024-11-09',
  'The Department of Transport has announced the deferral of the Administrative Adjudication of Road Traffic Offences (AARTO) Act implementation to July 1, 2026. This gives additional time for system readiness and stakeholder preparation.',
  'high',
  'deferred',
  'https://www.transport.gov.za'
);