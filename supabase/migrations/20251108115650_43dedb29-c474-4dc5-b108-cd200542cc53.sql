-- CRITICAL SECURITY FIX: Remove role columns from users and profiles tables
-- Part 1: Add unique constraint to user_roles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END $$;

-- Part 2: Sync existing roles to user_roles table to prevent data loss

-- Sync roles from profiles table to user_roles
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT 
  p.user_id,
  p.role::text,
  true
FROM public.profiles p
WHERE p.role IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.user_id 
    AND ur.role = p.role::text
  );

-- Sync roles from users table to user_roles
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT 
  u.id,
  u.role::text,
  true
FROM public.users u
WHERE u.role IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = u.id 
    AND ur.role = u.role::text
  );

-- Part 3: Drop the role columns (CRITICAL SECURITY FIX)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
ALTER TABLE public.users DROP COLUMN IF EXISTS role;

-- Part 4: Add comments to prevent re-adding these columns
COMMENT ON TABLE public.profiles IS 'User profiles. SECURITY: Do not add role column - use user_roles table with has_role() function';
COMMENT ON TABLE public.users IS 'User records. SECURITY: Do not add role column - use user_roles table with has_role() function';