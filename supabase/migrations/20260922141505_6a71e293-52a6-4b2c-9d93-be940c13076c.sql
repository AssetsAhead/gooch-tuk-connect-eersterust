
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investor_access_codes TO authenticated;
GRANT ALL ON public.investor_access_codes TO service_role;
GRANT SELECT ON public.investor_nda_acceptances TO authenticated;
GRANT ALL ON public.investor_nda_acceptances TO service_role;
