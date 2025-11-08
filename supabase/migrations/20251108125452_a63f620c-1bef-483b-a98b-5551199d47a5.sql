-- Fix search_path for notify_role_request_change function
-- Drop trigger first, then function, then recreate both

DROP TRIGGER IF EXISTS role_request_status_change ON public.role_requests;
DROP FUNCTION IF EXISTS public.notify_role_request_change();

CREATE OR REPLACE FUNCTION public.notify_role_request_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create notification for status changes (not new requests)
  IF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
    IF NEW.status = 'approved' THEN
      PERFORM public.create_notification(
        NEW.user_id,
        'Role Request Approved',
        'Your request for ' || NEW.requested_role || ' role has been approved!',
        'success',
        NEW.id,
        'role_request'
      );
    ELSIF NEW.status = 'rejected' THEN
      PERFORM public.create_notification(
        NEW.user_id,
        'Role Request Update',
        'Your request for ' || NEW.requested_role || ' role has been reviewed.',
        'warning',
        NEW.id,
        'role_request'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER role_request_status_change
AFTER UPDATE ON public.role_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_role_request_change();