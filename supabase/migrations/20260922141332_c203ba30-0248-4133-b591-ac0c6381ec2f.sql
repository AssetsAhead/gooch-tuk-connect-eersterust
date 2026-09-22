
ALTER TABLE public.investor_access_codes
  ADD COLUMN IF NOT EXISTS investor_name text,
  ADD COLUMN IF NOT EXISTS investor_email text,
  ADD COLUMN IF NOT EXISTS max_uses integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS used_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS last_used_at timestamptz;

-- existing shared code stays usable
UPDATE public.investor_access_codes SET max_uses = 999 WHERE code = 'MOJA-2026-UK';

CREATE TABLE IF NOT EXISTS public.investor_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  company text,
  email text NOT NULL,
  phone text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  issued_code text,
  ip_address text,
  user_agent text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.investor_access_requests TO authenticated;
GRANT ALL ON public.investor_access_requests TO service_role;

ALTER TABLE public.investor_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view access requests"
  ON public.investor_access_requests FOR SELECT TO authenticated
  USING (public.is_current_user_admin());

CREATE POLICY "Admins can update access requests"
  ON public.investor_access_requests FOR UPDATE TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

CREATE TRIGGER update_investor_access_requests_updated_at
  BEFORE UPDATE ON public.investor_access_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_investor_access_requests_status
  ON public.investor_access_requests (status, created_at DESC);
