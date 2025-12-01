-- Drop ALL existing SASSA verification policies
DROP POLICY IF EXISTS "Users can view their own SASSA verifications" ON public.sassa_verifications;
DROP POLICY IF EXISTS "Users can create their own SASSA verification" ON public.sassa_verifications;
DROP POLICY IF EXISTS "Users can update their own pending verifications" ON public.sassa_verifications;
DROP POLICY IF EXISTS "Admins can view all SASSA verifications" ON public.sassa_verifications;
DROP POLICY IF EXISTS "Admins can update SASSA verifications" ON public.sassa_verifications;
DROP POLICY IF EXISTS "Admins can delete SASSA verifications" ON public.sassa_verifications;

-- Recreate with enhanced security
-- Policy: Users can only view their own SASSA verifications
CREATE POLICY "Users can view their own SASSA verifications"
ON public.sassa_verifications
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own SASSA verification
CREATE POLICY "Users can create their own SASSA verification"
ON public.sassa_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending verifications only
CREATE POLICY "Users can update their own pending verifications"
ON public.sassa_verifications
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Policy: Admins can view all SASSA verifications
CREATE POLICY "Admins can view all SASSA verifications"
ON public.sassa_verifications
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Policy: Admins can update any SASSA verification
CREATE POLICY "Admins can update SASSA verifications"
ON public.sassa_verifications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Policy: Admins can delete SASSA verifications
CREATE POLICY "Admins can delete SASSA verifications"
ON public.sassa_verifications
FOR DELETE
USING (has_role(auth.uid(), 'admin'));