-- Drop and recreate remaining policies
DROP POLICY IF EXISTS "Users can update their own registration" ON public.user_registrations;
DROP POLICY IF EXISTS "Admins can update any registration" ON public.user_registrations;
DROP POLICY IF EXISTS "Admins can delete registrations" ON public.user_registrations;

-- Add update policy for users
CREATE POLICY "Users can update their own registration"
ON public.user_registrations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add update policy for admins
CREATE POLICY "Admins can update any registration"
ON public.user_registrations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add delete policy for admins only
CREATE POLICY "Admins can delete registrations"
ON public.user_registrations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));