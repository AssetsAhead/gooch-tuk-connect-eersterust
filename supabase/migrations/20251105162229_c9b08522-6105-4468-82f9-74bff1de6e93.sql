-- Fix user_roles RLS policies to prevent privilege escalation
-- Drop the existing overly permissive update policy
DROP POLICY IF EXISTS "Only admins can manage user roles - update" ON user_roles;

-- Create stricter policies that separate role management from role switching
-- Admins can fully manage roles (insert, delete, update any field)
CREATE POLICY "Admins can fully manage user roles"
ON user_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
    AND ur.is_active = true
  )
);

-- Users can ONLY toggle is_active between their already-assigned roles
-- They cannot change the role itself or create new role assignments
CREATE POLICY "Users can switch between assigned roles"
ON user_roles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND role = (SELECT role FROM user_roles WHERE id = user_roles.id) -- Role must not change
);

-- Create audit logging table for admin actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON admin_audit_logs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- System can insert audit logs (for triggers)
CREATE POLICY "System can insert audit logs"
ON admin_audit_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = admin_id OR has_role(auth.uid(), 'admin'));

-- Create trigger to log role changes
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_role_changes
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION log_role_change();

-- Fix drivers table RLS - too permissive
DROP POLICY IF EXISTS "Authenticated users can view driver locations" ON drivers;

-- Drivers see their own data
CREATE POLICY "Drivers see own data"
ON drivers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Passengers see drivers assigned to their active rides
CREATE POLICY "Passengers see assigned drivers"
ON drivers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM rides
    WHERE rides.driver_id = drivers.user_id
    AND rides.passenger_id = auth.uid()
    AND rides.status IN ('requested', 'assigned', 'in_progress')
  )
);

-- Law enforcement sees all drivers
CREATE POLICY "Law enforcement sees all drivers"
ON drivers FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'police') OR
  has_role(auth.uid(), 'marshall')
);