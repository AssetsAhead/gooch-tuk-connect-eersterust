-- Add RLS policies for sassa-cards storage bucket
-- This ensures only authorized users can access SASSA verification photos

-- Policy 1: Users can upload their own SASSA cards
CREATE POLICY "Users can upload own SASSA cards"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sassa-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can view their own SASSA cards via signed URLs
CREATE POLICY "Users can view own SASSA cards"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'sassa-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Admins can view all SASSA cards for verification purposes
CREATE POLICY "Admins can view all SASSA cards"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'sassa-cards' AND
  public.has_role(auth.uid(), 'admin')
);

-- Policy 4: Users can update their own SASSA card uploads (for resubmission)
CREATE POLICY "Users can update own SASSA cards"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'sassa-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 5: Users can delete their own SASSA card uploads
CREATE POLICY "Users can delete own SASSA cards"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'sassa-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
);