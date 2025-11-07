-- Fix nullable user_id in drivers table
-- This prevents RLS bypass vulnerabilities where user_id could be NULL

-- First, check if there are any drivers with NULL user_id and handle them
-- We'll delete any orphaned records before adding the constraint
DELETE FROM public.drivers WHERE user_id IS NULL;

-- Now add NOT NULL constraint
ALTER TABLE public.drivers 
ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint to ensure one driver record per user (if not exists)
-- This prevents duplicate driver entries for the same user
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'drivers_user_id_unique'
  ) THEN
    ALTER TABLE public.drivers
    ADD CONSTRAINT drivers_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Create index for better query performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(user_id);