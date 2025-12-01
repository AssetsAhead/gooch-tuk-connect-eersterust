-- Insert pending driver registrations for Lloyd Pieters' fleet
-- These will be matched and approved when drivers sign up

INSERT INTO public.user_registrations (first_name, last_name, id_number, registration_status)
VALUES 
  ('Jayvandrey', 'Vyfers', '0411045090080', 'pending'),
  ('David', 'Makhwanya', '8509295199089', 'pending');

-- Note: Lloyd Pieters (Owner) and vehicle details will need a vehicles table
-- For now, the driver registrations are created and ready to be matched when drivers sign up