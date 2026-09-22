CREATE TABLE public.investor_access_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  label text,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.investor_access_codes TO authenticated;
GRANT ALL ON public.investor_access_codes TO service_role;
ALTER TABLE public.investor_access_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage investor access codes" ON public.investor_access_codes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.investor_nda_acceptances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  company text,
  email text NOT NULL,
  access_code text,
  ip_address text,
  user_agent text,
  accepted_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.investor_nda_acceptances TO authenticated;
GRANT ALL ON public.investor_nda_acceptances TO service_role;
ALTER TABLE public.investor_nda_acceptances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view NDA acceptances" ON public.investor_nda_acceptances
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.investor_access_codes (code, label) VALUES ('MOJA-2026-UK', 'UK investor prospect');