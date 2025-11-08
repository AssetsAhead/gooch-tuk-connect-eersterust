-- Fix SECURITY DEFINER functions by adding explicit search_path
-- This prevents privilege escalation via search path manipulation attacks

-- Fix handle_new_driver function
CREATE OR REPLACE FUNCTION public.handle_new_driver()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.driver_reputation (driver_id)
  VALUES (NEW.user_id);
  RETURN NEW;
END;
$$;

-- Fix prevent_role_changes function
CREATE OR REPLACE FUNCTION public.prevent_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow role changes only for admins
  IF OLD.role IS DISTINCT FROM NEW.role AND NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;
  RETURN NEW;
END;
$$;

-- Fix log_role_change function
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if the change was made by an admin
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  ) THEN
    INSERT INTO public.admin_audit_logs (admin_id, action_type, target_user_id, details)
    VALUES (
      auth.uid(),
      TG_OP || '_ROLE',
      COALESCE(NEW.user_id, OLD.user_id),
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'old_is_active', OLD.is_active,
        'new_is_active', NEW.is_active
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add comments documenting the security fix
COMMENT ON FUNCTION public.handle_new_driver() IS 'SECURITY: search_path explicitly set to prevent privilege escalation';
COMMENT ON FUNCTION public.prevent_role_changes() IS 'SECURITY: search_path explicitly set to prevent privilege escalation';
COMMENT ON FUNCTION public.log_role_change() IS 'SECURITY: search_path explicitly set to prevent privilege escalation';