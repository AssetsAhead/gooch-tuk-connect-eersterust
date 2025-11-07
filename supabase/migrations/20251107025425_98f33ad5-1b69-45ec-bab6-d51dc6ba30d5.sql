-- Add file_path column to sassa_verifications table
-- This enables secure server-side URL regeneration without storing time-limited URLs

ALTER TABLE public.sassa_verifications
ADD COLUMN file_path text;

-- Create index for faster file path lookups
CREATE INDEX IF NOT EXISTS idx_sassa_verifications_file_path 
ON public.sassa_verifications(file_path) 
WHERE file_path IS NOT NULL;

-- Add comment explaining the security design
COMMENT ON COLUMN public.sassa_verifications.file_path IS 
'Storage path for SASSA card in sassa-cards bucket. Used to generate time-limited signed URLs on-demand instead of storing expiring URLs in card_photo_url.';