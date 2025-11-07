-- Create admin sessions table for server-side master password tracking
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 minutes'),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can view their own sessions
CREATE POLICY "Admins can view their own sessions"
ON public.admin_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = admin_id AND has_role(auth.uid(), 'admin'));

-- System can insert sessions (called from edge function)
CREATE POLICY "System can create admin sessions"
ON public.admin_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = admin_id AND has_role(auth.uid(), 'admin'));

-- Create index for performance
CREATE INDEX idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_expires_at ON public.admin_sessions(expires_at);

-- Function to create admin session after master password verification
CREATE OR REPLACE FUNCTION public.create_admin_session(
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _session_id UUID;
BEGIN
  -- Verify user is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can create admin sessions';
  END IF;

  -- Delete any existing sessions for this admin
  DELETE FROM public.admin_sessions 
  WHERE admin_id = auth.uid();

  -- Create new session
  INSERT INTO public.admin_sessions (admin_id, ip_address, user_agent)
  VALUES (auth.uid(), _ip_address, _user_agent)
  RETURNING id INTO _session_id;

  RETURN _session_id;
END;
$$;

-- Function to check if current user has valid admin session
CREATE OR REPLACE FUNCTION public.has_valid_admin_session()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_sessions
    WHERE admin_id = auth.uid()
      AND expires_at > now()
  );
$$;

-- Function to cleanup expired sessions (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _deleted_count INTEGER;
BEGIN
  DELETE FROM public.admin_sessions
  WHERE expires_at <= now();
  
  GET DIAGNOSTICS _deleted_count = ROW_COUNT;
  RETURN _deleted_count;
END;
$$;

-- Function to revoke admin session (logout)
CREATE OR REPLACE FUNCTION public.revoke_admin_session()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_sessions
  WHERE admin_id = auth.uid();
  
  RETURN true;
END;
$$;