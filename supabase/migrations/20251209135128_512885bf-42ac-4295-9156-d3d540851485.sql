-- Create test users first
INSERT INTO public.users (id, name, phone, address)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Thabo Molefe', '0821234567', 'Poortjie'),
  ('a2222222-2222-2222-2222-222222222222', 'Sipho Ndlovu', '0827654321', 'Eldorado Park'),
  ('a3333333-3333-3333-3333-333333333333', 'David Mabaso', '0831112222', 'Lenasia'),
  ('a4444444-4444-4444-4444-444444444444', 'Mandla Zulu', '0823334444', 'Poortjie Central')
ON CONFLICT (id) DO NOTHING;

-- Now insert test drivers with the user references
INSERT INTO public.drivers (user_id, name, vehicle, location, status, rating, eta)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Thabo Molefe', 'White Bajaj RE', 'Poortjie Rank', 'online', 4.8, 3),
  ('a2222222-2222-2222-2222-222222222222', 'Sipho Ndlovu', 'Blue Bajaj RE', 'Eldorado Park', 'online', 4.5, 5),
  ('a3333333-3333-3333-3333-333333333333', 'David Mabaso', 'Red Bajaj RE', 'Lenasia', 'online', 4.2, 8),
  ('a4444444-4444-4444-4444-444444444444', 'Mandla Zulu', 'Yellow Bajaj RE', 'Poortjie Central', 'online', 4.9, 2)
ON CONFLICT DO NOTHING;

-- Add driver reputation data
INSERT INTO public.driver_reputation (driver_id, rating, total_rides, compliance_score, champion_acts, infringements)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 4.8, 250, 95, 8, 0),
  ('a2222222-2222-2222-2222-222222222222', 4.5, 180, 88, 3, 1),
  ('a3333333-3333-3333-3333-333333333333', 4.2, 120, 82, 2, 2),
  ('a4444444-4444-4444-4444-444444444444', 4.9, 320, 98, 12, 0)
ON CONFLICT DO NOTHING;