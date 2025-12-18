-- Add photo_url to drivers table
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS photo_url text;

-- Add scheduled_for column to rides table for pre-booking
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS scheduled_for timestamp with time zone;

-- Add rating columns to rides table
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS driver_rating integer;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS driver_rating_comment text;

-- Add criminal_declaration_signed to user_registrations
ALTER TABLE public.user_registrations ADD COLUMN IF NOT EXISTS criminal_declaration_signed boolean DEFAULT false;
ALTER TABLE public.user_registrations ADD COLUMN IF NOT EXISTS criminal_declaration_signed_at timestamp with time zone;

-- Add document type for ICASA certificates
-- (Already supported by driver_documents table with document_type field)