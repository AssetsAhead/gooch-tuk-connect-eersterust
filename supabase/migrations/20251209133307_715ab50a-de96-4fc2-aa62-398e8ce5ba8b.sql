-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can fully manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage user roles - delete" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage user roles - insert" ON public.user_roles;
DROP POLICY IF EXISTS "Users can switch between assigned roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Recreate policies using SECURITY DEFINER functions that bypass RLS

-- Users can view their own roles (simple, no recursion)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all roles (uses SECURITY DEFINER function)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_current_user_admin());

-- Admins can insert roles (uses SECURITY DEFINER function)
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_current_user_admin());

-- Admins can update roles (uses SECURITY DEFINER function)
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_current_user_admin());

-- Admins can delete roles (uses SECURITY DEFINER function)
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- Allow service role / edge functions to manage roles (for SMS OTP user creation)
CREATE POLICY "Service role can manage roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);