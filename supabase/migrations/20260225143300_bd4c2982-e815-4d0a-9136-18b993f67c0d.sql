
-- Add verification_method column to driver_clockings
ALTER TABLE public.driver_clockings 
  ADD COLUMN IF NOT EXISTS verification_method text NOT NULL DEFAULT 'facial',
  ADD COLUMN IF NOT EXISTS pin_code text,
  ALTER COLUMN photo_path DROP NOT NULL;

-- Add driver_pin column to driver_face_registrations for PIN-based clocking
ALTER TABLE public.driver_face_registrations
  ADD COLUMN IF NOT EXISTS clocking_pin text;

COMMENT ON COLUMN public.driver_clockings.verification_method IS 'facial, pin, qr, marshal';
