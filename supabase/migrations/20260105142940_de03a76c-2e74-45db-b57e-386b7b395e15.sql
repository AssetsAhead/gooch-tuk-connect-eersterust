-- Fix has_role_text function to include proper search_path for security
CREATE OR REPLACE FUNCTION public.has_role_text(p_user_id uuid, p_role_text text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p_user_id
      AND ur.is_active = true
      AND public.safe_role_allowed(p_role_text)
      AND ur.role = p_role_text
  );
$function$;