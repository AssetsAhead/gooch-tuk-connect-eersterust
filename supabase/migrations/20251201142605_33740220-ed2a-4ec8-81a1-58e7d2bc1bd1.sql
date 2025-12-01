-- Insert Lloyd Pieters' Tuk Tuk fleet as seed data
-- Owner will be assigned when Lloyd Pieters signs up

INSERT INTO public.vehicles (registration_number, route_number, vehicle_type, color, status, notes)
VALUES 
  ('LC 97TZGP', 'E153', 'tuk_tuk', 'Yellow', 'active', 'Lloyd Pieters fleet - Driver: Jayvandrey Vyfers'),
  ('LC97TYGP', 'E154', 'tuk_tuk', 'Black', 'active', 'Lloyd Pieters fleet - Driver: David Makhwanya');