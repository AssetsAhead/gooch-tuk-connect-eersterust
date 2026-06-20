CREATE OR REPLACE FUNCTION public.create_admin_session_whitelisted(_ip_address text DEFAULT NULL, _user_agent text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _session_id uuid;
  _whitelist text[] := ARRAY[
    'assetsahead.sa@gmail.com',
    'realone.mel@gmail.com',
    'aggapo.johnston450@gmail.com',
    'chibalef@gmail.com'
  ];
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can create admin sessions';
  END IF;

  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();

  IF _email IS NULL OR NOT (lower(_email) = ANY (SELECT lower(unnest(_whitelist)))) THEN
    RAISE EXCEPTION 'Email not whitelisted for password-free admin access';
  END IF;

  DELETE FROM public.admin_sessions WHERE admin_id = auth.uid();

  INSERT INTO public.admin_sessions (admin_id, ip_address, user_agent)
  VALUES (auth.uid(), _ip_address, _user_agent)
  RETURNING id INTO _session_id;

  RETURN _session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_admin_session_whitelisted(text, text) TO authenticated;