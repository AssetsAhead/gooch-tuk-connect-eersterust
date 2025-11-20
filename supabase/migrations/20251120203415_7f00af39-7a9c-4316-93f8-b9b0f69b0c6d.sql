-- Secure handle_new_driver function with SET search_path
CREATE OR REPLACE FUNCTION public.handle_new_driver()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.driver_reputation (driver_id)
  VALUES (NEW.user_id);
  RETURN NEW;
END;
$function$;

-- Secure prevent_role_changes function with SET search_path
CREATE OR REPLACE FUNCTION public.prevent_role_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow role changes only for admins
  IF OLD.role IS DISTINCT FROM NEW.role AND NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;
  RETURN NEW;
END;
$function$;

-- Secure log_role_change function with SET search_path
CREATE OR REPLACE FUNCTION public.log_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;