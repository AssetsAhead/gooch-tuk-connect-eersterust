
-- FIX 3: Restrict regulatory-documents storage SELECT to ownership
DROP POLICY IF EXISTS "Users can view regulatory documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own regulatory documents" ON storage.objects;

CREATE POLICY "Owners view own regulatory documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'regulatory-documents'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin')
  )
);
