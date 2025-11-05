-- Fix search_path for log_role_change function to resolve linter warning
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if the change was made by an admin
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  ) THEN
    INSERT INTO admin_audit_logs (admin_id, action_type, target_user_id, details)
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;